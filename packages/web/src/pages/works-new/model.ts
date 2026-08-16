import * as workIo from "picms-server/features/work/io";
import * as z from "zod";

export const WORKS_NEW_INPUT_SCHEMA = workIo.CREATE_INPUT_SCHEMA.safeExtend({
	file: z.instanceof(File).nullable(),
});

export type WorksNewInput = z.infer<typeof WORKS_NEW_INPUT_SCHEMA>;
