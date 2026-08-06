import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

import { ERROR_CODE } from "../constants";
import * as workIo from "../features/work/io";
import * as drizzleRepositories from "../infrastructures/drizzle/repositories";

export const WORK_API = new Hono().post(
	"/",
	validator("json", (value) => {
		const parsed = workIo.CREATE_INPUT_SCHEMA.safeParse(value);
		if (!parsed.success) {
			const { status, message } = ERROR_CODE.BAD_REQUEST;
			throw new HTTPException(status, { message });
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
