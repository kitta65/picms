import { Hono } from "hono";
import { validator } from "hono/validator";
import { DEFAULT } from "../domains/config/entity";
import { CodedError } from "../errors";
import * as configIo from "../features/config/io";
import { configDatabase } from "../infrastructures/drizzle/repositories/config-database";

export const CONFIG_API = new Hono()
	.get("/", async (c) => {
		const repo = configDatabase;
		const res = await repo.findFirst();

		return c.json(res ?? DEFAULT);
	})
	.post(
		"/",
		validator("json", (value) => {
			const parsed = configIo.UPSERT_INPUT_SCHEMA.safeParse(value);
			if (!parsed.success) {
				throw new CodedError("BAD_REQUEST");
			}
			return parsed.data;
		}),
		async (c) => {
			const input = c.req.valid("json");
			const entity = configIo.UpsertInput.toEntity(input);
			const repo = configDatabase;
			await repo.upsert(entity);
			return c.json(entity);
		},
	);
