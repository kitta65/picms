import { HTTPException } from "hono/http-exception";
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
		const { status, message } = ERROR_CODE.NOT_FOUND;
		throw new HTTPException(status, { message });
	}

	if (!Revision.isWithinOrphanTtl(revision)) {
		const { status, message } = ERROR_CODE.REQUEST_TIMEOUT;
		throw new HTTPException(status, { message });
	}

	// avoid duplicate upload (best effort)
	const isAvailable = await RevisionService.checkStorageAvailability(revision, {
		revisionStorage: di.revisionStorage,
	});
	if (!isAvailable) {
		const { status, message } = ERROR_CODE.CONFLICT;
		throw new HTTPException(status, { message });
	}

	const url = await di.revisionStorage.issueSignedUrl(revisionId);
	return url;
}
