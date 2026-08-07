import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";
import { HTTPException } from "hono/http-exception";
import {
	ERROR_CODE,
	ORPHAN_REVISION_TTL_MINUTES,
	SIGNED_URL_TTL_MINUTES,
} from "../../constants";
import { CONFIG_SCHEMA, type Config } from "../../domains/config/entity";
import type { IConfigDatabase } from "../../domains/config/repository";
import { MESSAGE_SCHEMA, Message } from "../../domains/message/entity";
import type { IMessageBroker } from "../../domains/message/repository";
import { REVISION_SCHEMA, type Revision } from "../../domains/revision/entity";
import type { IRevisionDatabase } from "../../domains/revision/repository";
import type { Work } from "../../domains/work/entity";
import type { IWorkDatabase } from "../../domains/work/repository";
import { configTable, messageTable, revisionTable, workTable } from "./tables";

const { PG_PASS, PG_USER, PG_PORT } = Bun.env;
const DB = drizzle({
	connection: {
		hostname: "postgres",
		password: PG_PASS,
		username: PG_USER,
		port: PG_PORT,
	},
});

const CONFIG_ID = "019f9c30-51a0-7000-b96f-ab19bc1ceed2"; // currently only one config exists
export const configDatabase: IConfigDatabase = {
	findFirst: async () => {
		const configs = await DB.select()
			.from(configTable)
			.where(eq(configTable.id, CONFIG_ID));

		const config = configs.at(0);
		if (!config) {
			return undefined;
		}

		const parsed = CONFIG_SCHEMA.parse(config);
		return parsed;
	},
	upsert: async (config: Config) => {
		const result = await DB.insert(configTable)
			.values({ id: CONFIG_ID, ...config })
			.onConflictDoUpdate({
				target: configTable.id,
				set: config,
			})
			.returning();

		const upserted = result.at(0);

		const parsed = CONFIG_SCHEMA.parse(upserted);
		return parsed;
	},
};

export const workDatabase: IWorkDatabase = {
	findById: async (id: Work["id"]) => {
		const results = await DB.select()
			.from(workTable)
			.where(eq(workTable.id, id));
		const found = results.at(0);
		return found;
	},
	upsert: async (work: Work) => {
		const results = await DB.insert(workTable)
			.values(work)
			.onConflictDoUpdate({ target: workTable.id, set: work })
			.returning();
		const upserted = results.at(0);
		if (!upserted) {
			const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
			throw new HTTPException(status, { message });
		}

		return upserted;
	},
};

class RevisionDatabase implements IRevisionDatabase {
	messageBroker?: IMessageBroker;

	constructor(di?: { messageBroker: IMessageBroker }) {
		this.messageBroker = di?.messageBroker;
	}

	async insert(revision: Revision) {
		const result = await DB.transaction(async (tx) => {
			// insert
			const results = await tx
				.insert(revisionTable)
				.values(revision)
				.returning();
			const insertedRevision = results.at(0);
			if (!insertedRevision) {
				const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
				throw new HTTPException(status, { message });
			}

			// publish messages
			const scheduledAt = new Date();
			scheduledAt.setMinutes(
				scheduledAt.getMinutes() +
					ORPHAN_REVISION_TTL_MINUTES +
					SIGNED_URL_TTL_MINUTES +
					5, // margin
			);
			const revisionInsertedMessage = Message.create({
				type: "REVISION_INSERTED",
				targetId: insertedRevision.id,
			});
			const revisionSignedUrlExpiredMessage = Message.create({
				type: "REVISION_SIGNED_URL_EXPIRED",
				targetId: insertedRevision.id,
				scheduledAt,
			});

			let insertedMessages: unknown[] = [];
			if (this.messageBroker) {
				insertedMessages = await Promise.all([
					this.messageBroker.publish(revisionInsertedMessage),
					this.messageBroker.publish(revisionSignedUrlExpiredMessage),
				]);
			} else {
				insertedMessages = await tx
					.insert(messageTable)
					.values([revisionInsertedMessage, revisionSignedUrlExpiredMessage])
					.returning();
			}

			return { insertedRevision, insertedMessages };
		});

		const operationResult = {
			data: REVISION_SCHEMA.parse(result.insertedRevision),
			messages: result.insertedMessages.map((m) => MESSAGE_SCHEMA.parse(m)),
		};
		return operationResult;
	}

	async findById(id: Revision["id"]) {
		const revisions = await DB.select()
			.from(revisionTable)
			.where(eq(revisionTable.id, id));

		const revision = revisions.at(0);

		if (!revision) {
			return undefined;
		}

		const entity = REVISION_SCHEMA.parse(revision);
		return entity;
	}

	async deleteById(id: Revision["id"]) {
		await DB.delete(revisionTable).where(eq(revisionTable.id, id));
	}
}

export const revisionDatabase = new RevisionDatabase();

export const messageBroker: IMessageBroker = {
	publish: async (message: Message) => {
		const results = await DB.insert(messageTable).values(message).returning();
		const inserted = results.at(0);

		if (!inserted) {
			const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
			throw new HTTPException(status, { message });
		}

		const parsed = MESSAGE_SCHEMA.parse(inserted);
		return parsed;
	},

	pull: async (options?: {
		limit?: number;
		retryIntervalMinutes?: number;
		maxAttempts?: number;
	}) => {
		const limit = options?.limit;
		const nextScheduledAt = new Date();
		nextScheduledAt.setMinutes(
			nextScheduledAt.getMinutes() + (options?.retryIntervalMinutes ?? 0),
		);

		// transaction is required because update statement does not support order by clause
		const results = await DB.transaction(async (tx) => {
			// select
			const query = tx
				.select()
				.from(messageTable)
				.where(
					and(
						lt(messageTable.attemptCount, options?.maxAttempts ?? 1),
						lt(messageTable.scheduledAt, new Date()),
					),
				)
				.orderBy(messageTable.scheduledAt, messageTable.id);
			const shouldLimit = limit !== undefined;
			const selectResults = await (shouldLimit ? query.limit(limit) : query);

			// update
			const updateResults = await tx
				.update(messageTable)
				.set({
					scheduledAt: nextScheduledAt,
					attemptCount: sql`${messageTable.attemptCount} + 1`,
				})
				.where(
					inArray(
						messageTable.id,
						selectResults.map((res) => res.id),
					),
				)
				.returning();
			return updateResults;
		});
		const messages = results.map((res) => MESSAGE_SCHEMA.parse(res));
		return messages;
	},

	ack: async (id: Message["id"]) => {
		await DB.delete(messageTable).where(and(eq(messageTable.id, id)));
	},
};

export const _TEST = {
	DB,
	RevisionDatabase,
};
