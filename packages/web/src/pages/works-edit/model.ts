import * as workIo from "picms-server/features/work/io";
import * as z from "zod";

export const WORKS_EDIT_INPUT_SCHEMA = workIo.UPDATE_INPUT_SCHEMA.safeExtend({
	file: z.instanceof(File).nullable(),
});

export type WorksEditInput = z.infer<typeof WORKS_EDIT_INPUT_SCHEMA>;
