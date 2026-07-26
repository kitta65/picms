import type { AtLeast } from "picms-shared/types";

import type { Work } from "./entity";

export interface IWorkDatabase {
	create: (work: Work) => Promise<Work>;
	update: (work: AtLeast<Work, "id">) => Promise<Work>;
	getById: (id: Pick<Work, "id">) => Promise<Work | undefined>;
}
