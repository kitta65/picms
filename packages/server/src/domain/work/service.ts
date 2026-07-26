import type { Work } from "./entity";
import type { IWorkDatabase } from "./repository";

export async function update(entity: Work, db: IWorkDatabase): Promise<Work> {
	const modified = {
		...entity,
		createdAt: undefined,
		updatedAt: new Date(),
	};
	const updated = await db.update(modified);
	return updated;
}
