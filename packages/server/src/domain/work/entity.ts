import * as z from "zod";

export const workInputSchema = z.object({
	title: z.string().min(1, "Title is required."),
	description: z.string(),
	public: z.boolean(),
});
