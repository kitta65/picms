import type * as z from "zod";

import { WORK_SCHEMA, type Work } from "../../domains/work/entity";

export const CREATE_INPUT_SCHEMA = WORK_SCHEMA.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
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

// TODO: DTO
// although this is named READ_XXX_OUTPUT_SCHEMA, it is also used in other usecases
// export const READ_WORK_OUTPUT_SCHEMA = ...
