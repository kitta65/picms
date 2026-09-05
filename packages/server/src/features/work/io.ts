import * as z from "zod";

import { REVISION_SCHEMA } from "../../domains/revision/entity";
import { WORK_SCHEMA, type Work } from "../../domains/work/entity";

export const CREATE_INPUT_SCHEMA = WORK_SCHEMA.pick({
	title: true,
	tags: true,
	description: true,
	public: true,
});

type CreateInput = z.infer<typeof CREATE_INPUT_SCHEMA>;

export const CreateInput = {
	toEntity(input: CreateInput): Work {
		const validated = CREATE_INPUT_SCHEMA.parse(input);
		const id = Bun.randomUUIDv7();
		const ts = new Date();
		const work = { ...validated, id, createdAt: ts, updatedAt: ts };
		return work;
	},
};

export const FIND_ONE_OUTPUT_SCHEMA = WORK_SCHEMA.extend({
	revisionId: REVISION_SCHEMA.shape.id.nullable(),
});
export type FindOneOutput = z.infer<typeof FIND_ONE_OUTPUT_SCHEMA>;

export const FIND_MANY_INPUT_SCHEMA = z.object({
	limit: z.int().optional(),
	orderBy: z
		.record(
			z.enum(["createdAt"] satisfies (keyof Work)[]),
			z.enum(["asc", "desc"]),
		)
		.optional(),
});
export type FindManyInput = z.infer<typeof FIND_MANY_INPUT_SCHEMA>;

export const FIND_MANY_OUTPUT_SCHEMA = z.array(FIND_ONE_OUTPUT_SCHEMA);
export type FindManyOutput = z.infer<typeof FIND_MANY_OUTPUT_SCHEMA>;
