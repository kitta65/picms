import { HTTPException } from "hono/http-exception";
import * as z from "zod";
import { ERROR_CODE } from "../../constants";
import { REVISION_SCHEMA, type Revision } from "../../domains/revision/entity";
import {
	DISPLAY_MODES,
	type DisplayOptions,
} from "../../domains/revision/service";

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

const DISPLAY_SIZE_REGEX = /^(\d*)x(\d*)$/;
export const DISPLAY_INPUT_SCHEMA = z.object({
	id: REVISION_SCHEMA.shape.id,
	mode: z.enum(DISPLAY_MODES),
	size: z.string().regex(DISPLAY_SIZE_REGEX),
});

export type DisplayInput = z.infer<typeof DISPLAY_INPUT_SCHEMA>;
export const DisplayInput = {
	toDisplayOptions(input: DisplayInput): DisplayOptions {
		const mode = input.mode;
		const parsed = DISPLAY_SIZE_REGEX.exec(input.size);
		if (!parsed) {
			const { status, message } = ERROR_CODE.BAD_REQUEST;
			throw new HTTPException(status, { message });
		}

		const width = Number(parsed.at(1));
		const height = Number(parsed.at(2));

		if (!width || !height) {
			const { status, message } = ERROR_CODE.BAD_REQUEST;
			throw new HTTPException(status, { message });
		}

		const options: DisplayOptions = {
			resize: {
				mode,
				size: {
					width,
					height,
				},
			},
		};

		return options;
	},
};
