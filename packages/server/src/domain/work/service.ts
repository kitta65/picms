import type { Work } from "./entity";
import type { IWorkDatabase } from "./repository";

export async function upsert(db: IWorkDatabase, entity: Work): Promise<Work> {
	const upserted = await db.upsert(entity);
	return upserted;
}
