import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";

import type { Config } from "../../domain/config/entity";
import type { IConfigRepository } from "../../domain/config/repository";
import { configTable } from "./schema";

const DB = drizzle({
	connection: {
		hostname: "postgres",
		// biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature is specified in tsconfig.json
		password: Bun.env["PG_PASS"],
		// biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature is specified in tsconfig.json
		username: Bun.env["PG_USER"],
		port: 5432,
	},
});

const CONFIG_ID = 1; // currently only one config exists
export const drizzleConfigRepository: IConfigRepository = {
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
