import type * as z from "zod";

import {
	CONFIG_SCHEMA,
	type Config,
	DEFAULT,
} from "../../domains/config/entity";

export const UPSERT_INPUT_SCHEMA = CONFIG_SCHEMA.extend({
	// do not allow null as input
	timezone: CONFIG_SCHEMA.shape.timezone.refine(
		// unknown is a hack to make the infered type more permissive
		(val) => (val as unknown) !== null,
	),
}).partial();

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
