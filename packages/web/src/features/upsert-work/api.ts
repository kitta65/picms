import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useContext } from "react";
import { toast } from "sonner";
import { navigate } from "wouter/use-browser-location";
import {
	WORKS_EDIT_INPUT_SCHEMA,
	WORKS_NEW_INPUT_SCHEMA,
	type WorksEditInput,
	type WorksNewInput,
} from "@/features/upsert-work/model";
import { type ApiClient, ApiClientContext } from "@/shared/api";
import { ROUTE } from "@/shared/config";

const { fieldContext, formContext } = createFormHookContexts();
const formHook = createFormHook({
	fieldComponents: {},
	formComponents: {},
	fieldContext,
	formContext,
});
const { useAppForm } = formHook;
export const { withFieldGroup } = formHook;

type HandleSubmitOptions = {
	client: ApiClient;
	onSuccess: () => void;
	onError: () => void;
};

async function uploadFileToNewRevision(
	client: ApiClient,
	workId: string,
	file: File,
	onError: () => void,
) {
	const postRevisionResp = await client.api.private.revisions.$post({
		json: { workId },
	});
	if (!postRevisionResp.ok) {
		onError();
		return false;
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
		return false;
	}
	const signedUrl = await getSignedUrlResp.text();

	const putFileResp = await fetch(signedUrl, {
		method: "PUT",
		body: file,
	});
	if (!putFileResp.ok) {
		onError();
		return false;
	}

	return true;
}

async function handleSubmitWorksNewInput(
	input: WorksNewInput,
	{ client, onSuccess, onError }: HandleSubmitOptions,
) {
	const postWorkResp = await client.api.private.works.$post({
		json: input,
	});
	if (!postWorkResp.ok) {
		onError();
		return;
	}
	const work = await postWorkResp.json();

	const uploaded = await uploadFileToNewRevision(
		client,
		work.id,
		input.file,
		onError,
	);
	if (!uploaded) {
		return;
	}

	onSuccess();
}

export function useCreateWorkForm() {
	const client = useContext(ApiClientContext);
	const form = useAppForm({
		defaultValues: {
			file: null as File | null,
			title: "",
			tags: [] as string[],
			description: "",
			public: false,
		},
		validators: {
			onSubmit: WORKS_NEW_INPUT_SCHEMA,
		},
		onSubmit: async ({ value }) => {
			await handleSubmitWorksNewInput(WORKS_NEW_INPUT_SCHEMA.parse(value), {
				client,
				onSuccess: () => {
					toast.success("Saved!");
					navigate(ROUTE.WORKS.getLink());
				},
				onError: () => toast.error("Something Went Wrong."),
			});
		},
	});
	return form;
}

async function handleSubmitWorksEditInput(
	workId: string,
	input: WorksEditInput,
	{ client, onSuccess, onError }: HandleSubmitOptions,
) {
	const postWorkResp = await client.api.private.works[":id"].$post({
		param: { id: workId },
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

	const uploaded = await uploadFileToNewRevision(
		client,
		work.id,
		input.file,
		onError,
	);
	if (!uploaded) {
		return;
	}

	onSuccess();
}

export function useUpdateWorkForm(workId: string) {
	const client = useContext(ApiClientContext);
	const defaultValues: WorksEditInput = {
		id: workId,
		file: null,
		title: "",
		tags: [],
		description: "",
		public: false,
	};
	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: WORKS_EDIT_INPUT_SCHEMA,
		},
		onSubmit: async ({ value }) => {
			await handleSubmitWorksEditInput(
				workId,
				WORKS_EDIT_INPUT_SCHEMA.parse(value),
				{
					client,
					onSuccess: () => {
						toast.success("Saved!");
						navigate(ROUTE.WORKS.getLink());
					},
					onError: () => toast.error("Something Went Wrong."),
				},
			);
		},
	});
	return form;
}
