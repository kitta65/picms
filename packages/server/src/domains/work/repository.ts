import type { AtLeast, Awaitable } from "picms-shared/types";
import type { OperationResult } from "../message/types";
import type { Work } from "./entity";

export interface IWorkDatabase {
	insert: (work: Work) => Awaitable<Work>;
	update: (work: AtLeast<Work, "id" | "updatedAt">) => Awaitable<Work>;
	findById: (id: Work["id"]) => Awaitable<Work | undefined>;
	deleteById: (id: Work["id"]) => Awaitable<OperationResult<null>>;
}

class FakeWorkDatabase implements IWorkDatabase {
	insert(_: Work): ReturnType<IWorkDatabase["insert"]> {
		throw new Error("not implemented");
	}
	update(
		_: AtLeast<Work, "id" | "updatedAt">,
	): ReturnType<IWorkDatabase["update"]> {
		throw new Error("not implemented");
	}
	findById(_: Work["id"]): ReturnType<IWorkDatabase["findById"]> {
		throw new Error("not implemented");
	}
	deleteById(_: Work["id"]): ReturnType<IWorkDatabase["deleteById"]> {
		throw new Error("not implemented");
	}
}

export const forTesting = {
	FakeWorkDatabase,
};
