import { useSelector } from "@tanstack/react-store";
import { useEffect } from "react";
import { RevisionImage } from "@/entities/revision/ui";
import { useWorkQuery } from "@/entities/work/api";
import { useUpdateWorkForm } from "@/features/upsert-work/api";
import {
	UPSERT_WORK_FIELDS,
	UpsertWorkFields,
} from "@/features/upsert-work/ui";
import { useObjectUrl } from "@/shared/lib/object-url";
import { Button } from "@/shared/ui/shadcn/button";

type WorksEditProps = {
	workId: string;
};
export function WorksEdit({ workId }: WorksEditProps) {
	const { data: work, isLoading } = useWorkQuery(workId);
	const form = useUpdateWorkForm(workId);
	useEffect(() => {
		if (!work || isLoading) {
			return;
		}
		form.reset({ ...work, file: null });
	}, [work, isLoading, form]);

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
			<div className="flex justify-center items-center h-60">
				{previewUrl ? (
					<img src={previewUrl} alt={previewUrl} className="max-h-full" />
				) : work?.revisionId ? (
					<RevisionImage
						revisionId={work.revisionId}
						mode="inside"
						size="9999x240"
					/>
				) : (
					<span className="text-foreground">Image not found</span>
				)}
			</div>
			<UpsertWorkFields
				form={form}
				isCreate={false}
				fields={UPSERT_WORK_FIELDS}
			/>
			<div className="flex items-center justify-center gap-x-4">
				<Button
					variant="outline"
					type="button"
					onClick={() => form.reset()}
					disabled={isLoading}
				>
					Reset
				</Button>
				<Button type="submit" disabled={isLoading}>
					Submit
				</Button>
			</div>
		</form>
	);
}
