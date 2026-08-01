import type * as z from "zod";

import { REVISION_SCHEMA, type Revision } from "../../domain/revision/entity";

export const CREATE_INPUT_SCHEMA = REVISION_SCHEMA.omit({
	id: true,
	createdAt: true,
});
type CreateInput = z.infer<typeof CREATE_INPUT_SCHEMA>;
export const CreateInput = {
	toEntity(input: CreateInput): Revision {
		const entity = REVISION_SCHEMA.parse({
			...input,
			id: Bun.randomUUIDv7(),
			createdAt: new Date(),
		});
		return entity;
	},
};

export const FIND_BY_ID_INPUT_SCHEMA = REVISION_SCHEMA.pick({
	id: true,
});

export const ISSUE_SIGNED_URL_INPUT_SCHEMA = REVISION_SCHEMA.pick({
	id: true,
});
