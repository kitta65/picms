import type { Awaitable } from "picms-shared/types";

import type { Work } from "./entity";

export interface IWorkDatabase {
	upsert: (work: Work) => Awaitable<Work>;
	findById: (id: Work["id"]) => Awaitable<Work | undefined>;
}
