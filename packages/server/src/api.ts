import { Hono } from "hono";
import { CONFIG_API } from "./apis/config";
import { REVISION_API } from "./apis/revision";
import { WORK_API } from "./apis/work";
import { PRIVATE_API_BASE_PATH, STORAGE_API_BASE_PATH } from "./constants";
import * as eventUsecases from "./features/event/usecases";
import * as drizzleRepositories from "./infrastructures/drizzle/repositories";
import * as localRepository from "./infrastructures/local/repositories";
import { getRootUrl } from "./utils";

export const PRIVATE_API = new Hono()
	.basePath(PRIVATE_API_BASE_PATH)

	// middleware
	.use(async (_, next) => {
		await next();
		await eventUsecases.handleAll(
			drizzleRepositories.EventDatabase,
			drizzleRepositories.workDatabase,
			drizzleRepositories.revisionDatabase,
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
