import type * as z from "zod";

import { REVISION_SCHEMA, type Revision } from "../../domain/revision/entity";

export const CREATE_INPUT_SCHEMA = REVISION_SCHEMA.omit({
	id: true,
	createdAt: true,
}).brand();
type CreateInput = z.infer<typeof CREATE_INPUT_SCHEMA>;

export function toEntity(input: CreateInput): Revision {
	const entity = {
		...input,
		id: Bun.randomUUIDv7(),
		createdAt: new Date(),
	};
	return entity;
}

export const FIND_BY_ID_INPUT_SCHEMA = REVISION_SCHEMA.pick({
	id: true,
}).brand();
