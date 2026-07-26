import { Hono } from "hono";
import { validator } from "hono/validator";
import { configInputSchema } from "../domain/config/entity";
import * as configService from "../domain/config/service";
import * as drizzleRepositories from "../infrastructures/drizzle/repositories";

export const CONFIG_API = new Hono()
	.get("/", async (c) => {
		const repo = drizzleRepositories.configDatabase;
		const res = await configService.findFirst(repo);
		return c.json(res);
	})
	.post(
		"/",
		validator("json", (value, c) => {
			const parsed = configInputSchema.safeParse(value);
			if (!parsed.success) {
				return c.text("Invalid", 400);
			}
			return parsed.data;
		}),
		async (c) => {
			const entity = c.req.valid("json");
			const repo = drizzleRepositories.configDatabase;
			await configService.upsert(repo, entity);
			return c.json(entity);
		},
	);
