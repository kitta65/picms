import type { Awaitable } from "picms-shared/types";
import type { Revision } from "./entity";

export interface IRevisionDatabase {
	create: (workId: Revision) => Awaitable<Revision>;
	getById: (id: Revision["id"]) => Awaitable<Revision | undefined>;
	deleteById: (id: Revision["id"]) => Awaitable<Revision | undefined>;
}
