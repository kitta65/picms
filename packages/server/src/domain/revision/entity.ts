import * as z from "zod";

export const REVISION_SCHEMA = z.object({
	id: z.uuidv7(),
	workId: z.uuidv7(),
	createdAt: z.date(),
});
export type Revision = z.infer<typeof REVISION_SCHEMA>;
