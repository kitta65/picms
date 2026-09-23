import { Hono } from "hono";
import { validator } from "hono/validator";
import type { Di } from "../di";
import { DEFAULT } from "../domains/config/entity";
import { CodedError } from "../errors";
import * as configIo from "../features/config/io";

export function createConfigApi(di: Di) {
	return new Hono()
		.get("/", async (c) => {
			const repo = di.configDatabase;
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
				const repo = di.configDatabase;
				await repo.upsert(entity);
				return c.json(entity);
			},
		);
}
