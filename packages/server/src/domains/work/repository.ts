import { HTTPException } from "hono/http-exception";
import type { AtLeast, Awaitable } from "picms-shared/types";
import { ERROR_CODE } from "../../constants";
import type { OperationResult } from "../message/types";
import type { Work } from "./entity";

export interface IWorkDatabase {
	update: (work: AtLeast<Work, "id" | "updatedAt">) => Awaitable<Work>;
	upsert: (work: Work) => Awaitable<Work>;
	findById: (id: Work["id"]) => Awaitable<Work | undefined>;
	deleteById: (id: Work["id"]) => Awaitable<OperationResult<null>>;
}

class FakeWorkDatabase implements IWorkDatabase {
	update(
		_: AtLeast<Work, "id" | "updatedAt">,
	): ReturnType<IWorkDatabase["update"]> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
	upsert(_: Work): ReturnType<IWorkDatabase["upsert"]> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
	findById(_: Work["id"]): ReturnType<IWorkDatabase["findById"]> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
	deleteById(_: Work["id"]): ReturnType<IWorkDatabase["deleteById"]> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
}

export const _TEST = {
	FakeWorkDatabase,
};
