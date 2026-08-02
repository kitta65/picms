import { Hono } from "hono";
import { validator } from "hono/validator";

import * as workIo from "../features/work/io";
import * as drizzleRepositories from "../infrastructures/drizzle/repositories";

export const WORK_API = new Hono().post(
	"/",
	validator("json", (value, c) => {
		const parsed = workIo.CREATE_INPUT_SCHEMA.safeParse(value);
		if (!parsed.success) {
			return c.text("Invalid", 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const input = c.req.valid("json");
		const repo = drizzleRepositories.workDatabase;
		const work = workIo.CreateInput.toEntity(input);
		const result = await repo.upsert(work);
		return c.json(result, 200);
	},
);
