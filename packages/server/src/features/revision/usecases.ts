import { ERROR_CODE } from "../../constants";
import { Revision } from "../../domains/revision/entity";
import type { IRevisionDatabase } from "../../domains/revision/repository";
import * as RevisionService from "../../domains/revision/service";
import type { ISharedStorage } from "../../domains/shared/repository";

export async function issueSignedUrl(
	revisionId: Revision["id"],
	di: { revisionDatabase: IRevisionDatabase; revisionStorage: ISharedStorage },
) {
	const revision = await di.revisionDatabase.findById(revisionId);

	if (!revision) {
		throw new Error(ERROR_CODE.NOT_FOUND);
	}

	if (!Revision.isWithinOrphanTtl(revision)) {
		throw new Error(ERROR_CODE.REQUEST_TIMEOUT);
	}

	// avoid duplicate upload (best effort)
	const isAvailable = await RevisionService.checkStorageAvailability(revision, {
		revisionStorage: di.revisionStorage,
	});
	if (!isAvailable) {
		throw new Error(ERROR_CODE.CONFLICT);
	}

	const url = await di.revisionStorage.issueSignedUrl(revisionId);
	return url;
}
