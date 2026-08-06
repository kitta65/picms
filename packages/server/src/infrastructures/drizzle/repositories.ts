import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";
import {
	ORPHAN_REVISION_TTL_MINUTES,
	SIGNED_URL_TTL_MINUTES,
} from "../../constants";
import { CONFIG_SCHEMA, type Config } from "../../domains/config/entity";
import type { IConfigDatabase } from "../../domains/config/repository";
import { EVENT_SCHEMA, Event } from "../../domains/event/entity";
import type { IEventDatabase } from "../../domains/event/repository";
import { REVISION_SCHEMA, type Revision } from "../../domains/revision/entity";
import type { IRevisionDatabase } from "../../domains/revision/repository";
import type { Work } from "../../domains/work/entity";
import type { IWorkDatabase } from "../../domains/work/repository";
import { configTable, eventTable, revisionTable, workTable } from "./tables";

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

		if (configs.length === 0) {
			return undefined;
		}

		if (configs.length !== 1) {
			console.warn("found more than one config");
		}

		const parsed = CONFIG_SCHEMA.parse(configs.at(0));
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
			throw new Error("failed to upsert");
		}

		return upserted;
	},
};

class RevisionDatabase implements IRevisionDatabase {
	eventDatabase?: IEventDatabase;

	constructor(di?: { eventDatabase: IEventDatabase }) {
		this.eventDatabase = di?.eventDatabase;
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
				throw new Error("failed to insert revision");
			}

			// publish events
			const scheduledAt = new Date();
			scheduledAt.setMinutes(
				scheduledAt.getMinutes() +
					ORPHAN_REVISION_TTL_MINUTES +
					SIGNED_URL_TTL_MINUTES +
					5, // margin
			);
			const revisionInsertedEvent = Event.create({
				type: "REVISION_INSERTED",
				targetId: insertedRevision.id,
			});
			const revisionSignedUrlExpiredEvent = Event.create({
				type: "REVISION_SIGNED_URL_EXPIRED",
				targetId: insertedRevision.id,
				scheduledAt,
			});

			let insertedEvents: unknown[] = [];
			if (this.eventDatabase) {
				insertedEvents = await Promise.all([
					this.eventDatabase.insert(revisionInsertedEvent),
					this.eventDatabase.insert(revisionSignedUrlExpiredEvent),
				]);
			} else {
				insertedEvents = await tx
					.insert(eventTable)
					.values([revisionInsertedEvent, revisionSignedUrlExpiredEvent])
					.returning();
			}

			return { insertedRevision, insertedEvents };
		});

		const operationResult = {
			data: REVISION_SCHEMA.parse(result.insertedRevision),
			events: result.insertedEvents.map((e) => EVENT_SCHEMA.parse(e)),
		};
		return operationResult;
	}

	async findById(id: Revision["id"]) {
		const revisions = await DB.select()
			.from(revisionTable)
			.where(eq(revisionTable.id, id));

		if (revisions.length === 0) {
			return undefined;
		}

		if (revisions.length !== 1) {
			console.warn("found more than one revision");
		}

		const entity = REVISION_SCHEMA.parse(revisions.at(0));
		return entity;
	}

	async deleteById(id: Revision["id"]) {
		await DB.delete(revisionTable).where(eq(revisionTable.id, id));
	}
}

export const revisionDatabase = new RevisionDatabase();

export const eventDatabase: IEventDatabase = {
	insert: async (event: Event) => {
		const results = await DB.insert(eventTable).values(event).returning();
		const inserted = results.at(0);

		if (!inserted) {
			throw new Error("failed to insert");
		}

		const parsed = EVENT_SCHEMA.parse(inserted);
		return parsed;
	},

	attemptFirstN: async (options?: {
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
				.from(eventTable)
				.where(
					and(
						lt(eventTable.attemptCount, options?.maxAttempts ?? 1),
						lt(eventTable.scheduledAt, new Date()),
					),
				)
				.orderBy(eventTable.scheduledAt, eventTable.id);
			const shouldLimit = limit !== undefined;
			const selectResults = await (shouldLimit ? query.limit(limit) : query);

			// update
			const updateResults = await tx
				.update(eventTable)
				.set({
					scheduledAt: nextScheduledAt,
					attemptCount: sql`${eventTable.attemptCount} + 1`,
				})
				.where(
					inArray(
						eventTable.id,
						selectResults.map((res) => res.id),
					),
				)
				.returning();
			return updateResults;
		});
		const events = results.map((res) => EVENT_SCHEMA.parse(res));
		return events;
	},

	deleteById: async (id: Event["id"]) => {
		await DB.delete(eventTable).where(and(eq(eventTable.id, id)));
	},
};

export const _TEST = {
	DB,
	RevisionDatabase,
};
