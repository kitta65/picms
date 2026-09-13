import { useContext } from "react";
import { toast } from "sonner";
import { navigate } from "wouter/use-browser-location";
import { useWorkCreation, useWorkUpdate } from "@/entities/work/api";
import {
	CREATE_WORK_INPUT_SCHEMA,
	type CreateWorkInput,
	UPDATE_WORK_INPUT_SCHEMA,
	type UpdateWorkInput,
} from "@/features/upsert-work/model";
import { ApiClientContext } from "@/shared/api";
import { useAppForm } from "@/shared/lib/form";
import { ROUTE } from "@/shared/routes";

export function useCreateWorkForm() {
	const { mutateAsync } = useWorkCreation();
	const onSubmit = async (input: CreateWorkInput) => {
		const postWorkResp = await mutateAsync(input);
		if (!postWorkResp.ok) {
			throw new Error();
		}
		const work = await postWorkResp.json();

		const postRevisionResp = await client.api.private.revisions.$post({
			json: { workId: work.id },
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
			body: input.file,
		});
		if (!putFileResp.ok) {
			throw new Error("Failed to upload file");
		}
	};

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
			await onSubmit(CREATE_WORK_INPUT_SCHEMA.parse(value)).then(
				() => {
					toast.success("Saved!");
					navigate(ROUTE.WORKS.getLink());
				},
				() => toast.error("Something Went Wrong."),
			);
		},
	});
	return form;
}

export function useUpdateWorkForm(workId: string) {
	const client = useContext(ApiClientContext);
	const { mutateAsync } = useWorkUpdate();
	const defaultValues: UpdateWorkInput = {
		id: workId,
		file: null,
		title: "",
		tags: [],
		description: "",
		public: false,
	};

	const onSubmit = async (input: UpdateWorkInput) => {
		const postWorkResp = await mutateAsync(input);
		if (!postWorkResp.ok) {
			throw new Error();
		}

		if (!input.file) {
			return;
		}

		const postRevisionResp = await client.api.private.revisions.$post({
			json: { workId: input.id },
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
			body: input.file,
		});
		if (!putFileResp.ok) {
			throw new Error("Failed to upload file");
		}
	};

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: UPDATE_WORK_INPUT_SCHEMA,
		},
		onSubmit: async ({ value }) => {
			await onSubmit(UPDATE_WORK_INPUT_SCHEMA.parse(value)).then(
				() => {
					toast.success("Saved!");
					navigate(ROUTE.WORKS.getLink());
				},
				() => toast.error("Something Went Wrong."),
			);
		},
	});
	return form;
}
