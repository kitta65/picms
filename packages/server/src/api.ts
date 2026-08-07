import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { SERVER_ROUTE } from "picms-shared/constants";
import { CONFIG_API } from "./apis/config";
import { REVISION_API } from "./apis/revision";
import { WORK_API } from "./apis/work";
import {
	ERROR_CODE,
	PRIVATE_API_PATH,
	PUBLIC_API_PATH,
	STORAGE_API_PATH,
} from "./constants";
import * as messageUsecases from "./features/message/usecases";
import * as storageIo from "./features/storage/io";
import * as drizzleRepositories from "./infrastructures/drizzle/repositories";
import * as localRepository from "./infrastructures/local/repositories";

const MESSAGE_BATCH_SIZE = 10;

const PRIVATE_API = new Hono()
	// middleware
	.use(async (c, next) => {
		await next();

		// fire and forget!
		// if you use cloudflare someday, see https://hono.dev/docs/api/context#executionctx
		const splitted = c.req.url.split(PRIVATE_API_PATH);
		const basePath = splitted.at(0);
		if (splitted.length !== 2 || !basePath) {
			const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
			throw new HTTPException(status, { message });
		}
		const revisionStorage = new localRepository.RevisionStorage(
			basePath + STORAGE_API_PATH,
		);
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

		const splitted = c.req.url.split(STORAGE_API_PATH);
		const basePath = splitted.at(0);
		if (splitted.length !== 2 || !basePath) {
			const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
			throw new HTTPException(status, { message });
		}

		const storage = new localRepository.SharedStorage(
			basePath + STORAGE_API_PATH,
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
	.basePath(SERVER_ROUTE)
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
