import type { Awaitable } from "picms-shared/types";
import { ERROR_CODE } from "../../constants";
import type { Work } from "./entity";

export interface IWorkDatabase {
	upsert: (work: Work) => Awaitable<Work>;
	findById: (id: Work["id"]) => Awaitable<Work | undefined>;
}

class FakeWorkDatabase implements IWorkDatabase {
	upsert(_: Work): Awaitable<Work> {
		throw new Error(ERROR_CODE.NOT_IMPLEMENTED);
	}
	findById(_: Work["id"]): Awaitable<Work | undefined> {
		throw new Error(ERROR_CODE.NOT_IMPLEMENTED);
	}
}

export const _TEST = {
	FakeWorkDatabase,
};
