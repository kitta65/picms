import * as workIo from "picms-server/features/work/io";
import * as z from "zod";

export const WORKS_NEW_INPUT_SCHEMA = workIo.CREATE_INPUT_SCHEMA.safeExtend({
	file: z.instanceof(File),
});
export type WorksNewInput = z.infer<typeof WORKS_NEW_INPUT_SCHEMA>;

// though the server accepts partial input, we specify `required()` here
// to avoid unnecessary conditional branching caused by undefined.
export const WORKS_EDIT_INPUT_SCHEMA =
	workIo.UPDATE_INPUT_SCHEMA.required().safeExtend({
		file: z.instanceof(File).nullable(),
	});
export type WorksEditInput = z.infer<typeof WORKS_EDIT_INPUT_SCHEMA>;

export type CommonPart = {
	file: File | null;
	title: string;
	description: string;
	tags: string[];
	public: boolean;
};
