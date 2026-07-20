import type { WorkRevision } from "./entity";
import type { IWorkRevisionDatabase } from "./repository";

export async function create(db: IWorkRevisionDatabase): Promise<WorkRevision> {
	const created = await db.create();
	return created;
}

export async function getById(
	db: IWorkRevisionDatabase,
	id: number,
): Promise<WorkRevision | undefined> {
	const fetched = await db.getById(id);
	return fetched;
}
