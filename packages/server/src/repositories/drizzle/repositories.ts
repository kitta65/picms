import { and, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";

import type { Config } from "../../domain/config/entity";
import type { IConfigRepository } from "../../domain/config/repository";
import type { Work } from "../../domain/work/entity";
import type { IWorkDatabase } from "../../domain/work/repository";
import type { IWorkRevisionDatabase } from "../../domain/work-revision/repository";
import { configTable, workRevisionTable, workTable } from "./schema";

const { PG_PASS, PG_USER } = Bun.env;
const DB = drizzle({
	connection: {
		hostname: "postgres",
		password: PG_PASS,
		username: PG_USER,
		port: 5432,
	},
});

const CONFIG_ID = 1; // currently only one config exists
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
		await DB.insert(configTable)
			.values({ id: CONFIG_ID, ...config })
			.onConflictDoUpdate({
				target: configTable.id,
				set: config,
			});
		return config;
	},
};

export const workDatabase: IWorkDatabase = {
	upsert: async (work: Work) => {
		const inserted = await DB.transaction(async (tx) => {
			const insertedWorks = await tx
				.insert(workTable)
				.values({
					...work,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			const insertedWork = insertedWorks.at(0);
			if (!insertedWork) {
				throw new Error("failed to insert work");
			}

			await tx
				.update(workRevisionTable)
				.set({
					workId: insertedWork.id,
				})
				.where(
					and(isNull(workRevisionTable.workId), eq(workRevisionTable.id, 1)),
				);

			return insertedWork;
		});

		if (!inserted) {
			throw new Error("failed to insert");
		}
		return inserted;
	},
};

export const workRevisionDatabase: IWorkRevisionDatabase = {
	create: async () => {
		const result = await DB.insert(workRevisionTable)
			.values({
				createdAt: new Date(),
			})
			.returning();

		const revision = result.at(0);
		if (!revision) {
			throw new Error("failed to insert");
		}

		return revision;
	},

	getById: async (id: number) => {
		const revisions = await DB.select()
			.from(workRevisionTable)
			.where(eq(workRevisionTable.id, id));

		if (revisions.length === 0) {
			return undefined;
		}

		if (revisions.length !== 1) {
			console.warn("found more than one revision");
		}

		return revisions.at(0);
	},
};
