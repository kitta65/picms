import type { Config } from "./entity";

export interface IConfigRepository {
	upsert: (config: Config) => Promise<Config>;
}
