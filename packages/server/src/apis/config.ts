import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { ERROR_CODE } from "../constants";
import * as configIo from "../features/config/io";
import * as drizzleRepositories from "../infrastructures/drizzle/repositories";

export const CONFIG_API = new Hono()
	.get("/", async (c) => {
		const repo = drizzleRepositories.configDatabase;
		const res = await repo.findFirst();

		// FIXME:
		// it has special meaning to return undefined.
		// instead we should return default config
		// see https://github.com/TanStack/query/discussions/6029
		return c.json(res);
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
