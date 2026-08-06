import { HTTPException } from "hono/http-exception";
import { ERROR_CODE } from "./constants";

// NOTE: currently headers (e.g. x-forwarded-proto) are not considered
export function getRootUrl(req: Request) {
	const url = new URL(req.url);
	const proto = url.protocol;
	const host = url.host;

	return `${proto}//${host}`;
}

export function assertNever(_: never): never {
	const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
	throw new HTTPException(status, { message });
}
