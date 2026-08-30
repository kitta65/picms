import type { DisplayInput } from "picms-server/features/revision/io";
import { useContext } from "react";
import { ApiClientContext } from "@/shared/api";

export type RevisionImageProps = DisplayInput;
export function RevisionImage(props: RevisionImageProps) {
	const client = useContext(ApiClientContext);
	const url = client.api.private.revisions[":id"][":mode"][":size"].$url({
		param: props,
	});
	return <img src={url.toString()} alt="" />;
}
