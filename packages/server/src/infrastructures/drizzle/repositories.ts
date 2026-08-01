import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";

import type { Config } from "../../domain/config/entity";
import type { IConfigRepository } from "../../domain/config/repository";
import { EVENT_SCHEMA, type Event } from "../../domain/event/entity";
import type { IEventDatabase } from "../../domain/event/repository";
import { REVISION_SCHEMA, type Revision } from "../../domain/revision/entity";
import type { IRevisionDatabase } from "../../domain/revision/repository";
import type { Work } from "../../domain/work/entity";
import type { IWorkDatabase } from "../../domain/work/repository";
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
		const results = await DB.insert(revisionTable).values(revision).returning();

		const created = results.at(0);
		if (!created) {
			throw new Error("failed to insert");
		}

		const entity = REVISION_SCHEMA.parse(created);
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
	insert: async (event: Event) => {
		const results = await DB.insert(eventTable).values(event).returning();

		const created = results.at(0);
		if (!created) {
			throw new Error("failed to insert");
		}

		return event;
	},

	deleteById: async (id: Event["id"]) => {
		await DB.delete(eventTable)
			.where(and(eq(eventTable.id, id)))
			.returning();
	},

	findMany: async (options?: { limit?: number }) => {
		const limit = options?.limit;
		const query = DB.select().from(eventTable).orderBy(eventTable.id);
		const shouldLimit = limit !== undefined;
		const results = await (shouldLimit ? query.limit(limit) : query);
		const events = results.map((res) => EVENT_SCHEMA.parse(res));
		return events;
	},
};
