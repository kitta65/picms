import type { Config } from "./entity";

export interface IConfigRepository {
	findFirst: () => Promise<Config | undefined>;
	upsert: (config: Config) => Promise<Config>;
}
