import * as z from "zod";
import { REVISION_SCHEMA } from "../../domains/revision/entity";
import { WORK_SCHEMA, type Work } from "../../domains/work/entity";
import type { IWorkDatabase } from "../../domains/work/repository";

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

export const UPDATE_INPUT_SCHEMA = z.object({
	id: WORK_SCHEMA.shape.id,
	title: WORK_SCHEMA.shape.title.optional(),
	tags: WORK_SCHEMA.shape.tags.optional(),
	description: WORK_SCHEMA.shape.description.optional(),
	public: WORK_SCHEMA.shape.public.optional(),
});
type UpdateInput = z.infer<typeof UPDATE_INPUT_SCHEMA>;
export const UpdateInput = {
	forRepository(input: UpdateInput): Parameters<IWorkDatabase["update"]>[0] {
		const validated = UPDATE_INPUT_SCHEMA.parse(input);
		const work = {
			...validated,
			updatedAt: new Date(),
		};
		return work;
	},
};

export const FIND_BY_ID_INPUT_SCHEMA = z.object({
	id: WORK_SCHEMA.shape.id,
});
export type FindByIdInput = z.infer<typeof FIND_BY_ID_INPUT_SCHEMA>;

export const FIND_ONE_OUTPUT_SCHEMA = WORK_SCHEMA.extend({
	revisionId: REVISION_SCHEMA.shape.id.nullable(),
}).optional();
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

export const FIND_MANY_OUTPUT_SCHEMA = z.array(FIND_ONE_OUTPUT_SCHEMA.unwrap());
export type FindManyOutput = z.infer<typeof FIND_MANY_OUTPUT_SCHEMA>;
