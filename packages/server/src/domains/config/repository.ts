import type { Awaitable } from "picms-shared/types";
import type { Config } from "./entity";

export interface IConfigDatabase {
	findFirst: () => Awaitable<Config | undefined>;
	upsert: (config: Config) => Awaitable<Config>;
}
