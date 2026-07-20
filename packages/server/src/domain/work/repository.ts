import type { Work } from "./entity";

export interface IWorkDatabase {
	upsert: (work: Work) => Promise<Work>;
}
