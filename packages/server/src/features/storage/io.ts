import * as z from "zod";

export const REVISION_POST_SCHEMA = z.object({
	id: z.uuidv7(),
});
