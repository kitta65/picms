import type { Revision } from "./entity";
import type { IRevisionDatabase } from "./repository";

export async function create(
	revision: Revision,
	db: IRevisionDatabase,
): Promise<Revision> {
	const created = await db.create(revision);
	return created;
}

export async function findById(
	id: Revision["id"],
	db: IRevisionDatabase,
): Promise<Revision | undefined> {
	const fetched = await db.getById(id);
	return fetched;
}

export async function deleteById(id: Revision["id"], db: IRevisionDatabase) {
	await db.deleteById(id);
}
