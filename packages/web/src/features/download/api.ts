import { useContext } from "react";
import type { IDownloadable } from "@/features/download/model";
import { ApiClientContext } from "@/shared/api";

export function useDownloadUrl(downloadable: IDownloadable) {
	const client = useContext(ApiClientContext);
	if (!downloadable.revisionId) {
		return;
	}

	const url = client.api.private.revisions[":id"].download.$url({
		param: { id: downloadable.revisionId },
	});
	return url.toString();
}
