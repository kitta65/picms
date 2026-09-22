import { eq } from "drizzle-orm";
import { CONFIG_SCHEMA } from "../../../domains/config/entity";
import type { IConfigDatabase } from "../../../domains/config/repository";
import { DB } from "../configs";
import { configTable } from "../tables";

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
	upsert: async (config: Parameters<IConfigDatabase["upsert"]>[0]) => {
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
