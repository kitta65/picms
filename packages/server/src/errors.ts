// http status codes are in mind, but do not have to stick to it
const ERROR_CODES = [
	"BAD_REQUEST",
	"UNAUTHORIZED",
	"FORBIDDEN",
	"NOT_FOUND",
	"REQUEST_TIMEOUT",
	"CONFLICT",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

// NOTE:
// CodedError is intended to be used for expected error.
// For unexpected errors, you can just `throw new Error()` instead.
export class CodedError extends Error {
	code: ErrorCode;

	constructor(code: ErrorCode) {
		super(`CodedError: ${code}`);
		this.name = "CodedError";
		this.code = code;
	}
}
