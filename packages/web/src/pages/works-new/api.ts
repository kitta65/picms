import { hc } from "hono/client";
import type { PicmsApi } from "picms-server/api";
import type { WorksNewInput } from "@/pages/works-new/model";

const CLIENT = hc<PicmsApi>(window.location.origin);

export async function handleSubmitWorksNewInput(
	input: WorksNewInput,
	cb: { onSuccess: () => void; onError: () => void },
) {
	const postWorkResp = await CLIENT.api.private.works.$post({
		json: input,
	});
	if (!postWorkResp.ok) {
		cb.onError();
		return;
	}
	const work = await postWorkResp.json();

	if (!input.file) {
		cb.onSuccess();
		return;
	}

	const postRevisionResp = await CLIENT.api.private.revisions.$post({
		json: { workId: work.id },
	});
	if (!postRevisionResp.ok) {
		cb.onError();
	}
	const revision = await postRevisionResp.json();

	const getSignedUrlResp = await CLIENT.api.private.revisions[":id"][
		"signed-url"
	].$get({
		param: {
			id: revision.id.toString(),
		},
	});
	if (!getSignedUrlResp.ok) {
		cb.onError();
		return;
	}
	const signedUrl = await getSignedUrlResp.text();

	const putFileResp = await fetch(signedUrl, {
		method: "PUT",
		body: input.file,
	});
	if (!putFileResp.ok) {
		cb.onError();
		return;
	}

	cb.onSuccess();
}
