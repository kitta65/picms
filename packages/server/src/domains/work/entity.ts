import * as z from "zod";

export const WORK_SCHEMA = z.object({
	id: z.uuidv7(),
	title: z.string().min(1),
	tags: z.array(z.string().min(1)),
	description: z.string(),
	public: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type Work = z.infer<typeof WORK_SCHEMA>;
