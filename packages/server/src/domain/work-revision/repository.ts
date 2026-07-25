import type { Awaitable } from "picms-shared/types";
import type { WorkRevision } from "./entity";

export interface IWorkRevisionDatabase {
	create: () => Awaitable<WorkRevision>;
	getById: (id: number) => Awaitable<WorkRevision | undefined>;
	deleteById: (id: number) => Awaitable<WorkRevision | undefined>;
}
