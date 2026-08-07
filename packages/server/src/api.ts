import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { CONFIG_API } from "./apis/config";
import { REVISION_API } from "./apis/revision";
import { WORK_API } from "./apis/work";
import {
	ERROR_CODE,
	PICMS_API_PATH,
	PRIVATE_API_PATH,
	PUBLIC_API_PATH,
	STORAGE_API_PATH,
} from "./constants";
import * as messageUsecases from "./features/message/usecases";
import * as storageIo from "./features/storage/io";
import * as drizzleRepositories from "./infrastructures/drizzle/repositories";
import * as localRepository from "./infrastructures/local/repositories";
import { getRootUrl } from "./utils";

const MESSAGE_BATCH_SIZE = 10;

const PRIVATE_API = new Hono()
	// middleware
	.use(async (c, next) => {
		await next();

		// fire and forget!
		// if you use cloudflare someday, see https://hono.dev/docs/api/context#executionctx
		const apiBaseUrl = `${getRootUrl(c.req.raw)}${PICMS_API_PATH}${STORAGE_API_PATH}`;
		const revisionStorage = new localRepository.RevisionStorage(apiBaseUrl);
		messageUsecases
			.handleFirstN(MESSAGE_BATCH_SIZE, {
				messageBroker: drizzleRepositories.messageBroker,
				workDatabase: drizzleRepositories.workDatabase,
				revisionDatabase: drizzleRepositories.revisionDatabase,
				revisionStorage,
			})
			.catch((e) => console.error(e));
	})

	.route("/works", WORK_API)
	.route("/revisions", REVISION_API)
	.route("/configs", CONFIG_API);

const PUBLIC_API = new Hono().post("/", (c) => {
	return c.text("hello from server");
});

const STORAGE_API = new Hono().put(
	"/:directory/:id",
	validator("param", (value) => {
		const parsed = storageIo.STORAGE_POST_SCHEMA.safeParse(value);
		if (!parsed.success) {
			const { status, message } = ERROR_CODE.BAD_REQUEST;
			throw new HTTPException(status, { message });
		}
		return parsed.data;
	}),

	async (c) => {
		const { PICMS_STORAGE } = Bun.env;
		if (PICMS_STORAGE !== "local") {
			const { status, message } = ERROR_CODE.NOT_FOUND;
			throw new HTTPException(status, { message });
		}

		const apiBaseUrl = `${getRootUrl(c.req.raw)}${PICMS_API_PATH}${STORAGE_API_PATH}`;
		const storage = new localRepository.SharedStorage(
			apiBaseUrl,
			c.req.valid("param").directory,
		);

		const token = c.req.query("token");
		if (!token) {
			const { status, message } = ERROR_CODE.FORBIDDEN;
			throw new HTTPException(status, { message });
		}
		const id = c.req.valid("param").id;
		const blob = await c.req.blob();
		await storage.save(id, token, blob);
		return c.text("ok", 200);
	},
);

export const PICMS_API = new Hono()
	.basePath(PICMS_API_PATH)
	.route(PRIVATE_API_PATH, PRIVATE_API)
	.route(PUBLIC_API_PATH, PUBLIC_API)
	.route(STORAGE_API_PATH, STORAGE_API)
	.onError((err, c) => {
		if (err instanceof HTTPException) {
			return err.getResponse();
		}

		// fallback
		const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
		return c.text(message, status);
	});
export type PicmsApi = typeof PICMS_API;
