import { Hono } from "hono";
import { validator } from "hono/validator";
import { SERVER_ROUTE } from "picms-shared/constants";
import { createConfigApi } from "./apis/config";
import { createRevisionApi } from "./apis/revision";
import { createWorkApi } from "./apis/work";
import {
	PRIVATE_API_PATH,
	PUBLIC_API_PATH,
	STORAGE_API_PATH,
} from "./constants";
import { Di } from "./di";
import { CodedError, type ErrorCode } from "./errors";
import * as messageUsecases from "./features/message/usecases";
import * as storageIo from "./features/storage/io";
import * as localRepository from "./infrastructures/local/repositories";
import type { ApiOptions } from "./options";

const MESSAGE_BATCH_SIZE = 10;

function createPrivateApi(di: Di) {
	return (
		new Hono()
			// middleware
			.use(async (_, next) => {
				await next();

				// fire and forget!
				// if you use cloudflare someday, see https://hono.dev/docs/api/context#executionctx
				messageUsecases
					.handleFirstN(MESSAGE_BATCH_SIZE, di)
					.catch((e) => console.error(e));
			})

			.route("/works", createWorkApi(di))
			.route("/revisions", createRevisionApi(di))
			.route("/configs", createConfigApi(di))
	);
}

function createPublicApi() {
	return new Hono().post("/", (c) => {
		return c.text("hello from server");
	});
}

function createStorageApi(options: ApiOptions) {
	return new Hono()
		.use(async (c, next) => {
			if (options.storageType !== "local") {
				return c.body(null, 404);
			}
			await next();
		})
		.put(
			"/:directory/:id",
			validator("param", (value) => {
				const parsed = storageIo.STORAGE_POST_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}
				return parsed.data;
			}),

			async (c) => {
				if (options.storageType !== "local") {
					throw new Error("can't be!");
				}
				const origin = options.storageLocalOrigin;
				// since this is a dedicated endpoint for local storage, no DI here
				const storage = new localRepository.SharedStorage(
					origin + SERVER_ROUTE + STORAGE_API_PATH,
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
}

const RESPONSE_BY_ERROR_CODE = {
	BAD_REQUEST: { status: 400, message: "Bad Request" },
	UNAUTHORIZED: { status: 401, message: "Unauthorized" },
	FORBIDDEN: { status: 403, message: "Forbidden" },
	NOT_FOUND: { status: 404, message: "Not Found" },
	REQUEST_TIMEOUT: { status: 408, message: "Request Timeout" },
	CONFLICT: { status: 409, message: "Conflict" },
} as const satisfies { [k in ErrorCode]: { status: number; message: string } };

export function createPicmsApi(options: ApiOptions) {
	const di = Di.fromOptions(options);
	return new Hono()
		.basePath(SERVER_ROUTE)
		.route(PRIVATE_API_PATH, createPrivateApi(di))
		.route(PUBLIC_API_PATH, createPublicApi())
		.route(STORAGE_API_PATH, createStorageApi(options))
		.onError((err, c) => {
			if (err instanceof CodedError) {
				const { status, message } = RESPONSE_BY_ERROR_CODE[err.code];
				return c.text(message, status);
			}

			// fallback
			return c.text("Internal Server Error", 500);
		});
}
export type PicmsApi = ReturnType<typeof createPicmsApi>;
