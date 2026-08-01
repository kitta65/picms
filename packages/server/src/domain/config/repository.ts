import type { Awaitable } from "picms-shared/types";
import type { Config } from "./entity";

export interface IConfigRepository {
	findFirst: () => Awaitable<Config | undefined>;
	upsert: (config: Config) => Awaitable<Config>;
}
