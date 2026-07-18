import { drizzle } from "drizzle-orm/bun-sql";

import type { Config } from "../../domain/config/entity";
import type { IConfigRepository } from "../../domain/config/repository";
import { configTable } from "./schema";

const DB = drizzle({
	connection: {
		hostname: "postgres",
		password: "pass",
		username: "picms",
		port: 5432,
	},
});

const CONFIG_ID = 1; // currently only one config exists
export const drizzleConfigRepository: IConfigRepository = {
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
