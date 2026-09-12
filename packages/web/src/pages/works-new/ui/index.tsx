import { useSelector } from "@tanstack/react-store";
import { useCreateWorkForm } from "@/features/upsert-work/api";
import {
	SelectedFilePreview,
	UPSERT_WORK_FIELDS,
	UpsertWorkFields,
	useObjectUrl,
} from "@/features/upsert-work/ui";
import { Button } from "@/shared/ui/shadcn/button";

export function WorksNew() {
	const form = useCreateWorkForm();
	const file = useSelector(form.store, (state) => state.values.file);
	const previewUrl = useObjectUrl(file);

	return (
		<form
			className="w-full min-w-0 max-w-200"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<SelectedFilePreview url={previewUrl} />
			<UpsertWorkFields form={form} isCreate fields={UPSERT_WORK_FIELDS} />
			<div className="flex items-center justify-center gap-x-4">
				<Button variant="outline" type="button" onClick={() => form.reset()}>
					Reset
				</Button>
				<Button type="submit">Submit</Button>
			</div>
		</form>
	);
}
