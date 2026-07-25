import { Hono } from "hono";
import { PRIVATE_API_BASE_PATH, STORAGE_API_BASE_PATH } from "./constants";
import { CONFIG_API } from "./features/config/api";
import * as eventUsecases from "./features/event/usecases";
import { REVISION_API } from "./features/revision/api";
import { WORK_API } from "./features/work/api";
import * as drizzleRepositories from "./repositories/drizzle/repositories";
import * as localRepository from "./repositories/local/repositories";
import { getRootUrl } from "./utils";

export const PRIVATE_API = new Hono()
	.basePath(PRIVATE_API_BASE_PATH)

	// middleware
	.use(async (_, next) => {
		await next();
		await eventUsecases.handleAll(
			drizzleRepositories.EventDatabase,
			drizzleRepositories.workRevisionDatabase,
		);
	})

	.route("/works", WORK_API)
	.route("/revisions", REVISION_API)
	.route("/configs", CONFIG_API);
export type PrivateApi = typeof PRIVATE_API;

export const PUBLIC_API = new Hono()
	.basePath(PRIVATE_API_BASE_PATH)
	.post("/", (c) => {
		return c.text("hello from server");
	});
export type PublicApi = typeof PUBLIC_API;

export const STORAGE_API = new Hono()
	.basePath(STORAGE_API_BASE_PATH)

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
