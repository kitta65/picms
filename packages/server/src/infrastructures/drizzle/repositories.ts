import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";
import {
	ORPHAN_REVISION_TTL_MINUTES,
	SIGNED_URL_TTL_MINUTES,
} from "../../constants";
import type { Config } from "../../domains/config/entity";
import type { IConfigRepository } from "../../domains/config/repository";
import { EVENT_SCHEMA, Event } from "../../domains/event/entity";
import type { IEventDatabase } from "../../domains/event/repository";
import { REVISION_SCHEMA, type Revision } from "../../domains/revision/entity";
import type { IRevisionDatabase } from "../../domains/revision/repository";
import type { Work } from "../../domains/work/entity";
import type { IWorkDatabase } from "../../domains/work/repository";
import { configTable, eventTable, revisionTable, workTable } from "./schema";

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
export const configDatabase: IConfigRepository = {
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

		return configs.at(0);
	},
	upsert: async (config: Config) => {
		const upserted = await DB.insert(configTable)
			.values({ id: CONFIG_ID, ...config })
			.onConflictDoUpdate({
				target: configTable.id,
				set: config,
			});
		return upserted;
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

export const revisionDatabase: IRevisionDatabase = {
	insert: async (revision: Revision) => {
		const inserted = await DB.transaction(async (tx) => {
			// insert
			const results = await tx
				.insert(revisionTable)
				.values(revision)
				.returning();
			const inserted = results.at(0);
			if (!inserted) {
				throw new Error("failed to insert revision");
			}

			// issue event
			const scheduledAt = new Date();
			scheduledAt.setMinutes(
				scheduledAt.getMinutes() +
					ORPHAN_REVISION_TTL_MINUTES +
					SIGNED_URL_TTL_MINUTES +
					5, // margin
			);
			const revisionInsetedEvent = Event.create({
				type: "REVISION_INSERTED",
				targetId: inserted.id,
			});
			const revisionSignedUrlExpiredEvent = Event.create({
				type: "REVISION_SIGNED_URL_EXPIRED",
				targetId: inserted.id,
				scheduledAt,
			});
			await tx
				.insert(eventTable)
				.values([revisionInsetedEvent, revisionSignedUrlExpiredEvent]);

			return inserted;
		});

		const entity = REVISION_SCHEMA.parse(inserted);
		return entity;
	},

	findById: async (id: Revision["id"]) => {
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
	},

	deleteById: async (id: Revision["id"]) => {
		await DB.delete(revisionTable).where(eq(revisionTable.id, id)).returning();
	},
};

export const EventDatabase: IEventDatabase = {
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
			const results = await (shouldLimit ? query.limit(limit) : query);

			// update
			await tx
				.update(eventTable)
				.set({
					scheduledAt: nextScheduledAt,
					attemptCount: sql`${eventTable.attemptCount} + 1`,
				})
				.where(
					inArray(
						eventTable.id,
						results.map((res) => res.id),
					),
				);
			return results;
		});
		const events = results.map((res) => EVENT_SCHEMA.parse(res));
		return events;
	},

	deleteById: async (id: Event["id"]) => {
		await DB.delete(eventTable)
			.where(and(eq(eventTable.id, id)))
			.returning();
	},
};
