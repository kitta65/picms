import { HTTPException } from "hono/http-exception";
import { ERROR_CODE } from "./constants";

export function assertNever(_: never): never {
	const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
	throw new HTTPException(status, { message });
}
