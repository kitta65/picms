import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { ERROR_CODE } from "../constants";
import { DEFAULT } from "../domains/config/entity";
import * as configIo from "../features/config/io";
import * as drizzleRepositories from "../infrastructures/drizzle/repositories";

export const CONFIG_API = new Hono()
	.get("/", async (c) => {
		const repo = drizzleRepositories.configDatabase;
		const res = await repo.findFirst();

		return c.json(res ?? DEFAULT);
	})
	.post(
		"/",
		validator("json", (value) => {
			const parsed = configIo.UPSERT_INPUT_SCHEMA.safeParse(value);
			if (!parsed.success) {
				const { status, message } = ERROR_CODE.BAD_REQUEST;
				throw new HTTPException(status, { message });
			}
			return parsed.data;
		}),
		async (c) => {
			const input = c.req.valid("json");
			const entity = configIo.UpsertInput.toEntity(input);
			const repo = drizzleRepositories.configDatabase;
			await repo.upsert(entity);
			return c.json(entity);
		},
	);
