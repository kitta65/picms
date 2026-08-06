import { HTTPException } from "hono/http-exception";
import type { Awaitable } from "picms-shared/types";
import { ERROR_CODE } from "../../constants";
import type { OperationResult } from "../message/types";
import type { Revision } from "./entity";

export interface IRevisionDatabase {
	insert: (workId: Revision) => Awaitable<OperationResult<Revision>>;
	findById: (id: Revision["id"]) => Awaitable<Revision | undefined>;
	deleteById: (id: Revision["id"]) => Awaitable<void>;
}

class FakeRevisionDatabase implements IRevisionDatabase {
	insert(_: Revision): Awaitable<OperationResult<Revision>> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
	findById(_: Revision["id"]): Awaitable<Revision | undefined> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
	deleteById(_: Revision["id"]): Awaitable<void> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
}

export const _TEST = {
	FakeRevisionDatabase,
};
