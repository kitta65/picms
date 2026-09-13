import type { DisplayInput } from "picms-server/features/revision/io";
import { useContext } from "react";
import { ApiClientContext } from "@/shared/api";

export type RevisionImageProps = DisplayInput & React.ComponentProps<"img">;
export function RevisionImage({
	revisionId,
	mode,
	size,
	...props
}: RevisionImageProps) {
	const client = useContext(ApiClientContext);
	const url = client.api.private.revisions[":revisionId"][":mode"][
		":size"
	].$url({
		param: { revisionId, mode, size },
	});
	return <img src={url.toString()} alt="" {...props} />;
}
