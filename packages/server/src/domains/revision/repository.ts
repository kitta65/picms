import type { Awaitable } from "picms-shared/types";
import type { OperationResult } from "../message/types";
import type { Revision } from "./entity";

export interface IRevisionDatabase {
	insert: (workId: Revision) => Awaitable<OperationResult<Revision>>;
	findById: (id: Revision["id"]) => Awaitable<Revision | undefined>;
	findByWorkId: (id: Revision["workId"]) => Awaitable<Revision[]>;
	// in most cases, should be called via domain service because it takes care of storage
	deleteById: (id: Revision["id"]) => Awaitable<void>;
}

class FakeRevisionDatabase implements IRevisionDatabase {
	insert(_: Revision): Awaitable<OperationResult<Revision>> {
		throw new Error("not implemented");
	}
	findById(_: Revision["id"]): Awaitable<Revision | undefined> {
		throw new Error("not implemented");
	}
	findByWorkId(
		_: Revision["workId"],
	): ReturnType<IRevisionDatabase["findByWorkId"]> {
		throw new Error("not implemented");
	}
	deleteById(_: Revision["id"]): Awaitable<void> {
		throw new Error("not implemented");
	}
}

export const forTesting = {
	FakeRevisionDatabase,
};
