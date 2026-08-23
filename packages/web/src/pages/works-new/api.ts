import type { WorksNewInput } from "@/pages/works-new/model";
import type { ApiClient } from "@/shared/api";

type HandleSubmitWorksNewInputOptions = {
	client: ApiClient;
	onSuccess: () => void;
	onError: () => void;
};

export async function handleSubmitWorksNewInput(
	input: WorksNewInput,
	{ client, onSuccess, onError }: HandleSubmitWorksNewInputOptions,
) {
	const postWorkResp = await client.api.private.works.$post({
		json: input,
	});
	if (!postWorkResp.ok) {
		onError();
		return;
	}
	const work = await postWorkResp.json();

	if (!input.file) {
		onSuccess();
		return;
	}

	const postRevisionResp = await client.api.private.revisions.$post({
		json: { workId: work.id },
	});
	if (!postRevisionResp.ok) {
		onError();
		return;
	}
	const revision = await postRevisionResp.json();

	const getSignedUrlResp = await client.api.private.revisions[":id"][
		"signed-url"
	].$get({
		param: {
			id: revision.id.toString(),
		},
	});
	if (!getSignedUrlResp.ok) {
		onError();
		return;
	}
	const signedUrl = await getSignedUrlResp.text();

	const putFileResp = await fetch(signedUrl, {
		method: "PUT",
		body: input.file,
	});
	if (!putFileResp.ok) {
		onError();
		return;
	}

	onSuccess();
}
