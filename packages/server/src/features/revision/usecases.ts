import { Revision } from "../../domains/revision/entity";
import type { IRevisionDatabase } from "../../domains/revision/repository";
import * as RevisionService from "../../domains/revision/service";
import type { ISharedStorage } from "../../domains/shared/repository";

export async function issueSignedUrl(
	revisionId: Revision["id"],
	{ db, storage }: { db: IRevisionDatabase; storage: ISharedStorage },
) {
	const revision = await db.findById(revisionId);

	if (!revision) {
		throw new Error("revision not found");
	}

	if (!Revision.isWithinOrphanTtl(revision)) {
		throw new Error("revision is too old");
	}

	// avoid duplicate upload (best effort)
	const isAvailable = await RevisionService.checkStorageAvailability(revision, {
		storage,
	});
	if (!isAvailable) {
		throw new Error("storage is not available");
	}

	const url = await storage.getSignedUrl(revisionId);
	return url;
}
