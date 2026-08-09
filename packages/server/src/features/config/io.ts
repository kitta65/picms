import type * as z from "zod";

import {
	CONFIG_SCHEMA,
	type Config,
	DEFAULT,
} from "../../domains/config/entity";

export const UPSERT_INPUT_SCHEMA = CONFIG_SCHEMA.partial();
export type UpsertInput = z.infer<typeof UPSERT_INPUT_SCHEMA>;
export const UpsertInput = {
	toEntity(input: UpsertInput): Config {
		const entity = CONFIG_SCHEMA.parse({ ...DEFAULT, ...input });
		return entity;
	},
};

export const READ_SCHEMA = CONFIG_SCHEMA.pick({
	timezone: true,
});

export type ReadSchema = z.infer<typeof READ_SCHEMA>;
