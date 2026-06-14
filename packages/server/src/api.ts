import { Hono } from "hono";
import { validator } from "hono/validator";

import { workInputSchema } from "./models/work";

export const COMMON_API_BASE_PATH = "/api";
export const PRIVATE_API_BASE_PATH = `${COMMON_API_BASE_PATH}/private`;
export const PRIVATE_API = new Hono().basePath(PRIVATE_API_BASE_PATH).post(
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
);
export type PrivateApi = typeof PRIVATE_API;

export const PUBLIC_API_BASE_PATH = `${COMMON_API_BASE_PATH}/api/public`;
export const PUBLIC_API = new Hono()
	.basePath(PRIVATE_API_BASE_PATH)
	.post("/", (c) => {
		return c.text("hello from server");
	});
export type PublicApi = typeof PUBLIC_API;
