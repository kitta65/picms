import { Hono } from "hono";
import { validator } from "hono/validator";
import { SERVER_ROUTE } from "picms-shared/constants";
import { CONFIG_API } from "./apis/config";
import { REVISION_API } from "./apis/revision";
import { WORK_API } from "./apis/work";
import {
	PRIVATE_API_PATH,
	PUBLIC_API_PATH,
	STORAGE_API_PATH,
} from "./constants";
import { CodedError, type ErrorCode } from "./errors";
import * as messageUsecases from "./features/message/usecases";
import * as storageIo from "./features/storage/io";
import { messageBroker } from "./infrastructures/drizzle/repositories/message-broker";
import { revisionDatabase } from "./infrastructures/drizzle/repositories/revision-database";
import { workDatabase } from "./infrastructures/drizzle/repositories/work-database";
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
			throw new Error("cannot infer basePath");
		}
		const revisionStorage = new localRepository.RevisionStorage(
			basePath + STORAGE_API_PATH,
		);
		messageUsecases
			.handleFirstN(MESSAGE_BATCH_SIZE, {
				messageBroker,
				workDatabase,
				revisionDatabase,
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
			throw new CodedError("BAD_REQUEST");
		}
		return parsed.data;
	}),

	async (c) => {
		const { PICMS_STORAGE } = Bun.env;
		if (PICMS_STORAGE !== "local") {
			throw new Error("local storage is not enabled");
		}

		const splitted = c.req.url.split(STORAGE_API_PATH);
		const basePath = splitted.at(0);
		if (splitted.length !== 2 || !basePath) {
			throw new Error("cannot infer basePath");
		}

		const storage = new localRepository.SharedStorage(
			basePath + STORAGE_API_PATH,
			c.req.valid("param").directory,
		);

		const token = c.req.query("token");
		if (!token) {
			throw new CodedError("FORBIDDEN");
		}
		const id = c.req.valid("param").id;
		const blob = await c.req.blob();
		await storage.save(id, token, blob);
		return c.body(null, 201);
	},
);

const RESPONSE_BY_ERROR_CODE = {
	BAD_REQUEST: { status: 400, message: "Bad Request" },
	UNAUTHORIZED: { status: 401, message: "Unauthorized" },
	FORBIDDEN: { status: 403, message: "Forbidden" },
	NOT_FOUND: { status: 404, message: "Not Found" },
	REQUEST_TIMEOUT: { status: 408, message: "Request Timeout" },
	CONFLICT: { status: 409, message: "Conflict" },
} as const satisfies { [k in ErrorCode]: { status: number; message: string } };

export const PICMS_API = new Hono()
	.basePath(SERVER_ROUTE)
	.route(PRIVATE_API_PATH, PRIVATE_API)
	.route(PUBLIC_API_PATH, PUBLIC_API)
	.route(STORAGE_API_PATH, STORAGE_API)
	.onError((err, c) => {
		if (err instanceof CodedError) {
			const { status, message } = RESPONSE_BY_ERROR_CODE[err.code];
			return c.text(message, status);
		}

		// fallback
		return c.text("Internal Server Error", 500);
	});
export type PicmsApi = typeof PICMS_API;
