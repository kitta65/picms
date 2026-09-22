import { assertNever } from "picms-shared/types";
import { Revision } from "../../domains/revision/entity";
import type { IRevisionDatabase } from "../../domains/revision/repository";
import * as RevisionService from "../../domains/revision/service";
import type { ISharedStorage } from "../../domains/shared/repository";
import { CodedError } from "../../errors";

export async function issueSignedUrl(
	revisionId: Revision["id"],
	di: { revisionDatabase: IRevisionDatabase; revisionStorage: ISharedStorage },
) {
	const revision = await di.revisionDatabase.findById(revisionId);

	if (!revision) {
		throw new CodedError("NOT_FOUND");
	}

	if (!Revision.isWithinOrphanTtl(revision)) {
		throw new CodedError("REQUEST_TIMEOUT");
	}

	// avoid duplicate upload (best effort)
	const isAvailable = await RevisionService.checkStorageAvailability(revision, {
		revisionStorage: di.revisionStorage,
	});
	if (!isAvailable) {
		throw new CodedError("CONFLICT");
	}

	const url = await di.revisionStorage.issueSignedUrl(revisionId);
	return url;
}

function getContentTypeFromFileType(
	fileType: RevisionService.FileType,
): string {
	switch (fileType) {
		case "jpg":
			return "image/jpeg";
		default:
			assertNever(fileType);
	}
}

export async function download(
	revisionId: Revision["id"],
	di: {
		revisionDatabase: IRevisionDatabase;
		revisionStorage: ISharedStorage;
	},
) {
	const revision = await di.revisionDatabase.findById(revisionId);
	if (!revision) {
		throw new CodedError("NOT_FOUND");
	}

	const { stream, metadata } = await RevisionService.readWithMetadata(
		revision,
		di,
	);

	// see also https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition#triggering_download_prompt_for_a_resource
	return new Response(stream, {
		headers: {
			"Content-Type": getContentTypeFromFileType(metadata.fileType),
			"Content-Length": metadata.fileSize.toString(),
			"Content-Disposition": `attachment; filename="${revision.id}.${metadata.fileType}"`,
		},
	});
}
