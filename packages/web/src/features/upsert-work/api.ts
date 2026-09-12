import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useContext } from "react";
import { toast } from "sonner";
import { navigate } from "wouter/use-browser-location";
import {
	CREATE_WORK_INPUT_SCHEMA,
	type CreateWorkInput,
	UPDATE_WORK_INPUT_SCHEMA,
	type UpdateWorkInput,
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
	workId: string,
	file: File,
	{ client }: Pick<HandleSubmitOptions, "client">,
) {
	const postRevisionResp = await client.api.private.revisions.$post({
		json: { workId },
	});
	if (!postRevisionResp.ok) {
		throw new Error("Failed to create revision");
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
		throw new Error("Failed to get signed URL");
	}
	const signedUrl = await getSignedUrlResp.text();

	const putFileResp = await fetch(signedUrl, {
		method: "PUT",
		body: file,
	});
	if (!putFileResp.ok) {
		throw new Error("Failed to upload file");
	}
}

async function handleSubmitWorksNewInput(
	input: CreateWorkInput,
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

	try {
		await uploadFileToNewRevision(work.id, input.file, {
			client,
		});
	} catch {
		onError();
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
			onSubmit: CREATE_WORK_INPUT_SCHEMA,
		},
		onSubmit: async ({ value }) => {
			await handleSubmitWorksNewInput(CREATE_WORK_INPUT_SCHEMA.parse(value), {
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

async function handleSubmitUpdateWorkInput(
	input: UpdateWorkInput,
	{ client, onSuccess, onError }: HandleSubmitOptions,
) {
	const postWorkResp = await client.api.private.works[":id"].$post({
		param: { id: input.id },
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

	try {
		await uploadFileToNewRevision(work.id, input.file, {
			client,
		});
	} catch {
		onError();
		return;
	}

	onSuccess();
}

export function useUpdateWorkForm(workId: string) {
	const client = useContext(ApiClientContext);
	const defaultValues: UpdateWorkInput = {
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
			onSubmit: UPDATE_WORK_INPUT_SCHEMA,
		},
		onSubmit: async ({ value }) => {
			await handleSubmitUpdateWorkInput(UPDATE_WORK_INPUT_SCHEMA.parse(value), {
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
