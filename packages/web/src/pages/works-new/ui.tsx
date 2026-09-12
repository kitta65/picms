import { useSelector } from "@tanstack/react-store";
import { ImageIcon } from "lucide-react";
import { useCreateWorkForm } from "@/features/upsert-work/api";
import {
	UPSERT_WORK_FIELDS,
	UpsertWorkFields,
} from "@/features/upsert-work/ui";
import { useObjectUrl } from "@/shared/lib/object-url";
import { Button } from "@/shared/ui/shadcn/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/shared/ui/shadcn/empty";

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

type SelectedFilePreviewProps = {
	url: string | null;
};
function SelectedFilePreview({ url }: SelectedFilePreviewProps) {
	return (
		<div className="flex item-center justify-center h-60">
			{url ? (
				<img src={url} alt={url} />
			) : (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ImageIcon />
						</EmptyMedia>
						<EmptyTitle>No File</EmptyTitle>
						<EmptyDescription>No file is selected</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
