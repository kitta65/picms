import { Hono } from "hono";
import { validator } from "hono/validator";
import { workInputSchema } from "../../domain/work/entity";
import * as drizzleRepositories from "../../repositories/drizzle/repositories";

export const WORK_API = new Hono().post(
	"/",
	validator("json", (value, c) => {
		const parsed = workInputSchema.safeParse(value);
		if (!parsed.success) {
			return c.text("Invalid", 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const work = c.req.valid("json");
		const repo = drizzleRepositories.workDatabase;
		const result = await repo.upsert(work);
		return c.json(result, 200);
	},
);
