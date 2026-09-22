import type { AtLeast, Awaitable } from "picms-shared/types";
import { notImplemented } from "../../errors";
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
		notImplemented();
	}
	update(
		_: AtLeast<Work, "id" | "updatedAt">,
	): ReturnType<IWorkDatabase["update"]> {
		notImplemented();
	}
	findById(_: Work["id"]): ReturnType<IWorkDatabase["findById"]> {
		notImplemented();
	}
	deleteById(_: Work["id"]): ReturnType<IWorkDatabase["deleteById"]> {
		notImplemented();
	}
}

export const _TEST = {
	FakeWorkDatabase,
};
