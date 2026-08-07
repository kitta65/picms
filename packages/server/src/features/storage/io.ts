import * as z from "zod";

export const STORAGE_POST_SCHEMA = z.object({
	directory: z.string().min(1),
	id: z.uuidv7(),
});
