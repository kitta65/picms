import type { Awaitable } from "picms-shared/types";
import type {
	FindByIdInput,
	FindManyInput,
	FindManyOutput,
	FindOneOutput,
} from "./io";

export interface IWorkView {
	findById: (input: FindByIdInput) => Awaitable<FindOneOutput>;
	findMany: (input?: FindManyInput) => Awaitable<FindManyOutput>;
}
