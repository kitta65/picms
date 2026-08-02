import type { Awaitable } from "picms-shared/types";
import type { Revision } from "./entity";

export interface IRevisionDatabase {
	insert: (workId: Revision) => Awaitable<Revision>;
	findById: (id: Revision["id"]) => Awaitable<Revision | undefined>;
	deleteById: (id: Revision["id"]) => Awaitable<Revision | undefined>;
}
