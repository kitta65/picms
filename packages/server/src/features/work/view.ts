import type { Awaitable } from "picms-shared/types";
import type { FindManyInput, FindManyOutput } from "./io";

export interface IWorkView {
	findMany: (input?: FindManyInput) => Awaitable<FindManyOutput>;
}
