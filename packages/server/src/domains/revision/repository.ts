import type { Awaitable } from "picms-shared/types";
import type { OperationResult } from "../event/types";
import type { Revision } from "./entity";

export interface IRevisionDatabase {
	insert: (workId: Revision) => Awaitable<OperationResult<Revision>>;
	findById: (id: Revision["id"]) => Awaitable<Revision | undefined>;
	deleteById: (id: Revision["id"]) => Awaitable<void>;
}
