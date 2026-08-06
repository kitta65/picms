import { HTTPException } from "hono/http-exception";
import type { Awaitable } from "picms-shared/types";
import { ERROR_CODE } from "../../constants";
import type { Work } from "./entity";

export interface IWorkDatabase {
	upsert: (work: Work) => Awaitable<Work>;
	findById: (id: Work["id"]) => Awaitable<Work | undefined>;
}

class FakeWorkDatabase implements IWorkDatabase {
	upsert(_: Work): Awaitable<Work> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
	findById(_: Work["id"]): Awaitable<Work | undefined> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
}

export const _TEST = {
	FakeWorkDatabase,
};
