import { HTTPException } from "hono/http-exception";
import type { Awaitable } from "picms-shared/types";
import { ERROR_CODE } from "../../constants";

export interface ISharedStorage {
	issueSignedUrl: (id: string) => Awaitable<string>;
	checkAvailability: (id: string) => Awaitable<boolean>;
	readById: (id: string) => Awaitable<Buffer>;
	deleteById: (id: string) => Awaitable<void>;
}

class FakeSharedStorage implements ISharedStorage {
	issueSignedUrl(_: string): Awaitable<string> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
	checkAvailability(_: string): Awaitable<boolean> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
	readById(_: string): Awaitable<Buffer> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
	deleteById(_: string): Awaitable<void> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
}

export const _TEST = {
	FakeSharedStorage,
};
