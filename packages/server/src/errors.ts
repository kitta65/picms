import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ERROR_CODE } from "./constants";

type CodedErrorCode = Exclude<
	keyof typeof ERROR_CODE,
	"INTERNAL_SERVER_ERROR" | "NOT_IMPLEMENTED"
>;

export class CodedError extends Error {
	readonly code: CodedErrorCode;

	constructor(code: CodedErrorCode) {
		super(ERROR_CODE[code].message);
		this.name = "CodedError";
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
	if (err instanceof CodedError) {
		const { status, message } = ERROR_CODE[err.code];
		return c.text(message, status);
	}
	const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
	return c.text(message, status);
}
