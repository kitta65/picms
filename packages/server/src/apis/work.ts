import { Hono } from "hono";
import { validator } from "hono/validator";

import * as workIo from "../features/work/io";
import * as drizzleRepositories from "../repositories/drizzle/repositories";

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
		const repo = drizzleRepositories.workDatabase;
		const work = workIo.toEntity(c.req.valid("json"));
		const result = await repo.create(work);
		return c.json(result, 200);
	},
);
