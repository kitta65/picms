import * as workIo from "picms-server/features/work/io";
import * as z from "zod";

export const CREATE_WORK_INPUT_SCHEMA = workIo.CREATE_INPUT_SCHEMA.safeExtend({
	file: z.instanceof(File),
});
export type CreateWorkInput = z.infer<typeof CREATE_WORK_INPUT_SCHEMA>;

// though the server accepts partial input, we specify `required()` here
// to avoid unnecessary conditional branching caused by undefined.
export const UPDATE_WORK_INPUT_SCHEMA =
	workIo.UPDATE_INPUT_SCHEMA.required().safeExtend({
		file: z.instanceof(File).nullable(),
	});
export type UpdateWorkInput = z.infer<typeof UPDATE_WORK_INPUT_SCHEMA>;
