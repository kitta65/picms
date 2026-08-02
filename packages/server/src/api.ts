import { Hono } from "hono";
import { validator } from "hono/validator";
import { CONFIG_API } from "./apis/config";
import { REVISION_API } from "./apis/revision";
import { WORK_API } from "./apis/work";
import {
	PRIVATE_API_BASE_PATH,
	PUBLIC_API_BASE_PATH,
	STORAGE_API_BASE_PATH,
} from "./constants";
import * as eventUsecases from "./features/event/usecases";
import * as storageIo from "./features/storage/io";
import * as drizzleRepositories from "./infrastructures/drizzle/repositories";
import * as localRepository from "./infrastructures/local/repositories";
import { getRootUrl } from "./utils";

const EVENT_BATCH_SIZE = 10;

export const PRIVATE_API = new Hono()
	.basePath(PRIVATE_API_BASE_PATH)

	// middleware
	.use(async (c, next) => {
		await next();

		// fire and forget!
		// if you use cloudflare someday, see https://hono.dev/docs/api/context#executionctx
		const apiBaseUrl = `${getRootUrl(c.req)}${STORAGE_API_BASE_PATH}`;
		const revisionStorage = new localRepository.RevisionStorage(apiBaseUrl);
		eventUsecases
			.handleFirstN(EVENT_BATCH_SIZE, {
				eventDatabase: drizzleRepositories.EventDatabase,
				workDatabase: drizzleRepositories.workDatabase,
				revisionDatabase: drizzleRepositories.revisionDatabase,
				revisionStorage,
			})
			.catch((e) => console.error(e));
	})

	.route("/works", WORK_API)
	.route("/revisions", REVISION_API)
	.route("/configs", CONFIG_API);
export type PrivateApi = typeof PRIVATE_API;

export const PUBLIC_API = new Hono()
	.basePath(PUBLIC_API_BASE_PATH)
	.post("/", (c) => {
		return c.text("hello from server");
	});
export type PublicApi = typeof PUBLIC_API;

export const STORAGE_API = new Hono()
	.basePath(STORAGE_API_BASE_PATH)

	.put(
		"/revision/:id",
		validator("param", (value, c) => {
			const parsed = storageIo.REVISION_POST_SCHEMA.safeParse(value);
			if (!parsed.success) {
				return c.text("Invalid", 400);
			}
			return parsed.data;
		}),

		async (c) => {
			const { PICMS_STORAGE } = Bun.env;
			if (PICMS_STORAGE !== "local") {
				return c.text("Not Found", 404);
			}

			const apiBaseUrl = `${getRootUrl(c.req)}${STORAGE_API_BASE_PATH}`;
			const storage = new localRepository.RevisionStorage(apiBaseUrl);

			const token = c.req.query("token");
			if (!token) {
				return c.body(null, 403);
			}
			const id = c.req.valid("param").id;
			const blob = await c.req.blob();
			await storage.save(id, token, blob);
			return c.text("ok", 200);
		},
	);
