import { Hono } from "hono";
import { validator } from "hono/validator";
import type { Di } from "../di";
import { CodedError } from "../errors";
import * as workIo from "../features/work/io";
import * as drizzleViews from "../infrastructures/drizzle/views";

export function createWorkApi(di: Di) {
	return new Hono()
		.post(
			"/",
			validator("json", (value) => {
				const parsed = workIo.CREATE_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}
				return parsed.data;
			}),
			async (c) => {
				const input = c.req.valid("json");
				const repo = di.workDatabase;
				const work = workIo.CreateInput.toEntity(input);
				const result = await repo.insert(work);
				return c.json(result, 201);
			},
		)
		.get(
			"/",
			validator("query", (value) => {
				const parsed = workIo.FIND_MANY_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}
				return parsed.data;
			}),
			async (c) => {
				const input = c.req.valid("query");
				const view = drizzleViews.workView;
				const result = await view.findMany(input);
				return c.json(result, 200);
			},
		)
		.get(
			"/:id",
			validator("param", (value) => {
				const parsed = workIo.FIND_BY_ID_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}
				return parsed.data;
			}),
			async (c) => {
				const param = c.req.valid("param");
				const view = drizzleViews.workView;
				const result = await view.findById({ id: param.id });
				return c.json(result, 200);
			},
		)
		.post(
			"/:id",
			validator("json", (value) => {
				const parsed = workIo.UPDATE_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}
				return parsed.data;
			}),
			async (c) => {
				const input = c.req.valid("json");
				const repo = di.workDatabase;
				const work = workIo.UpdateInput.forRepository(input);
				const result = await repo.update(work);
				return c.json(result, 200);
			},
		)
		.delete(
			"/:id",
			validator("param", (value) => {
				const parsed = workIo.DELETE_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}
				return parsed.data;
			}),
			async (c) => {
				const input = c.req.valid("param");
				const repo = di.workDatabase;
				await repo.deleteById(input.id);
				return c.body(null, 204);
			},
		);
}
