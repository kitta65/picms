import type { WorkRevision } from "./entity";

export interface IWorkRevisionDatabase {
	create: () => Promise<WorkRevision>;
	getById: (id: number) => Promise<WorkRevision | undefined>;
}
