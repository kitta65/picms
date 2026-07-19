import { Hono } from "hono";
import { validator } from "hono/validator";

import { configInputSchema } from "./domain/config/entity";
import * as configService from "./domain/config/service";
import { workInputSchema } from "./domain/work/entity";
import { drizzleConfigRepository } from "./repositories/drizzle/repositories";

export const COMMON_API_BASE_PATH = "/api";
export const PRIVATE_API_BASE_PATH = `${COMMON_API_BASE_PATH}/private`;
export const PRIVATE_API = new Hono()
	.basePath(PRIVATE_API_BASE_PATH)
	.post(
		"/work",
		validator("json", (value, c) => {
			const parsed = workInputSchema.safeParse(value);
			if (!parsed.success) {
				return c.text("Invalid", 401);
			}
			return parsed.data;
		}),
		async (c) => {
			const body = c.req.valid("json");
			console.warn(`TODO: not implemented yet. ${JSON.stringify(body)} `);
			return c.json(body);
		},
	)
	.get("/config", async (c) => {
		const repo = drizzleConfigRepository;
		const res = await configService.findFirst(repo);
		return c.json(res);
	})
	.post(
		"/config",
		validator("json", (value, c) => {
			const parsed = configInputSchema.safeParse(value);
			if (!parsed.success) {
				return c.text("Invalid", 401);
			}
			return parsed.data;
		}),
		async (c) => {
			const entity = c.req.valid("json");
			const repo = drizzleConfigRepository;
			await configService.upsert(repo, entity);
			return c.json(entity);
		},
	);
export type PrivateApi = typeof PRIVATE_API;

export const PUBLIC_API_BASE_PATH = `${COMMON_API_BASE_PATH}/api/public`;
export const PUBLIC_API = new Hono()
	.basePath(PRIVATE_API_BASE_PATH)
	.post("/", (c) => {
		return c.text("hello from server");
	});
export type PublicApi = typeof PUBLIC_API;
