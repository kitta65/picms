import { Hono, type HonoRequest } from "hono";
import { validator } from "hono/validator";
import * as z from "zod";

import { configInputSchema } from "./domain/config/entity";
import * as configService from "./domain/config/service";
import { workInputSchema } from "./domain/work/entity";
import * as drizzleRepositories from "./repositories/drizzle/repositories";
import * as localRepository from "./repositories/local/repositories";

function getRootUrl(req: HonoRequest) {
	const requestUrl = new URL(req.url);
	const protocol =
		req.header("x-forwarded-proto") ||
		req.header("forwarded")?.match(/proto=([^;]+)/)?.[1] ||
		requestUrl.protocol.replace(":", "");
	const host =
		req.header("x-forwarded-host") ||
		req.header("forwarded")?.match(/host=([^;]+)/)?.[1] ||
		requestUrl.host;
	return `${protocol}://${host}`;
}

export const COMMON_API_BASE_PATH = "/api";
export const PRIVATE_API_BASE_PATH = `${COMMON_API_BASE_PATH}/private`;
export const PRIVATE_API = new Hono()
	.basePath(PRIVATE_API_BASE_PATH)

	// work
	.post(
		"/works",
		validator("json", (value, c) => {
			const parsed = workInputSchema.safeParse(value);
			if (!parsed.success) {
				return c.text("Invalid", 400);
			}
			return parsed.data;
		}),
		async (c) => {
			const work = c.req.valid("json");
			const repo = drizzleRepositories.workDatabase;
			const result = await repo.upsert(work);
			return c.json(result, 200);
		},
	)

	// work-revisions
	.post("/work-revisions", async (c) => {
		const repo = drizzleRepositories.workRevisionDatabase;
		const created = await repo.create();
		return c.json(created);
	})
	.get(
		"/work-revisions/:id/signed-url",
		validator("param", async (value, c) => {
			const { id } = value;
			const schema = z.coerce.number();
			const parsed = schema.safeParse(id);
			if (!parsed.success) {
				return c.text("Invalid", 401);
			}

			return parsed.data;
		}),
		async (c) => {
			const id = c.req.valid("param");
			const repo = drizzleRepositories.workRevisionDatabase;
			const revision = await repo.getById(id);

			// when revision is not found or revision is already associated with work
			if (!revision || revision.workId) {
				return c.text("Invalid", 401);
			}

			const apiBaseUrl = `${getRootUrl(c.req)}${STORAGE_API_BASE_PATH}`;
			const storage = new localRepository.SharedStorage(apiBaseUrl);
			const url = await storage.getSignedUrl(id.toString());
			return c.text(url);
		},
	)

	// config
	.get("/config", async (c) => {
		const repo = drizzleRepositories.configDatabase;
		const res = await configService.findFirst(repo);
		return c.json(res);
	})
	.post(
		"/config",
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
export type PrivateApi = typeof PRIVATE_API;

export const PUBLIC_API_BASE_PATH = `${COMMON_API_BASE_PATH}/api/public`;
export const PUBLIC_API = new Hono()
	.basePath(PRIVATE_API_BASE_PATH)
	.post("/", (c) => {
		return c.text("hello from server");
	});
export type PublicApi = typeof PUBLIC_API;

export const STORAGE_API_BASE_PATH = `${COMMON_API_BASE_PATH}/storage`;
export const STORAGE_API = new Hono()
	.basePath(STORAGE_API_BASE_PATH)

	// work
	.put("/:filename{.*}", async (c) => {
		const { PICMS_STORAGE } = Bun.env;
		if (PICMS_STORAGE !== "local") {
			return c.text("Not Found", 404);
		}

		const apiBaseUrl = `${getRootUrl(c.req)}${STORAGE_API_BASE_PATH}`;
		const storage = new localRepository.SharedStorage(apiBaseUrl);
		const token = c.req.query("token");
		if (!token) {
			return c.body(null, 403);
		}
		const filename = c.req.param().filename;
		const blob = await c.req.blob();
		await storage.save(filename, token, blob);
		return c.text("ok", 200);
	});
