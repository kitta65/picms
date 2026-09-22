import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ERROR_CODE } from "./constants";

export type AppErrorCode = Exclude<
	keyof typeof ERROR_CODE,
	"INTERNAL_SERVER_ERROR" | "NOT_IMPLEMENTED"
>;

export class AppError extends Error {
	readonly code: AppErrorCode;

	constructor(code: AppErrorCode) {
		super(ERROR_CODE[code].message);
		this.name = "AppError";
		this.code = code;
	}
}

export function notImplemented(): never {
	throw new Error("Not Implemented");
}

export function handleApiError(err: Error, c: Context) {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}
	if (err instanceof AppError) {
		const { status, message } = ERROR_CODE[err.code];
		return c.text(message, status);
	}
	const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
	return c.text(message, status);
}
