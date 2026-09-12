import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { withFieldGroup } from "@/features/upsert-work/api";
import type { CommonPart } from "@/features/upsert-work/model";
import { ContextualHelp } from "@/shared/ui/custom/contextual-help";
import { InputTags } from "@/shared/ui/custom/input-tags";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/shared/ui/shadcn/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/shared/ui/shadcn/field";
import { Input } from "@/shared/ui/shadcn/input";
import { Textarea } from "@/shared/ui/shadcn/textarea";

const defaultValues: CommonPart = {
	file: null,
	title: "",
	description: "",
	public: false,
	tags: [],
};

export const UPSERT_WORK_FIELDS = {
	file: "file",
	title: "title",
	description: "description",
	tags: "tags",
	public: "public",
} as const;

export function useObjectUrl(file: File | null) {
	const [url, setUrl] = useState<string | null>(null);
	useEffect(() => {
		if (!file) {
			setUrl(null);
			return;
		}
		const next = URL.createObjectURL(file);
		setUrl(next);
		return () => URL.revokeObjectURL(next);
	}, [file]);
	return url;
}

function ClearFileInputOnReset({
	file,
	fileInputRef,
}: {
	file: File | null;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
	useEffect(() => {
		if (!file && fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, [file, fileInputRef]);
	return null;
}

export const UpsertWorkFields = withFieldGroup({
	defaultValues,
	props: {
		isCreate: false,
	},
	render: function Render({ group, isCreate }) {
		const fileInputRef = useRef<HTMLInputElement>(null);
		return (
			<FieldGroup>
				<group.Subscribe selector={(state) => state.values.file}>
					{(file) => (
						<ClearFileInputOnReset file={file} fileInputRef={fileInputRef} />
					)}
				</group.Subscribe>
				<FieldSet>
					<group.Field name="file">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									{isCreate ? (
										<FieldLabel htmlFor={field.name}>File</FieldLabel>
									) : (
										<div className="flex items-center gap-x-1">
											<FieldLabel htmlFor={field.name}>File</FieldLabel>
											<ContextualHelp
												title="Not required"
												description="Choose a file only if you want to upload a new file."
											/>
										</div>
									)}
									<Input
										ref={fileInputRef}
										id={field.name}
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => {
											const file = e.target.files?.[0] ?? null;
											field.handleChange(file);
										}}
										aria-invalid={isInvalid}
										type="file"
									/>
								</Field>
							);
						}}
					</group.Field>
					<group.Field name="title">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Title</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Enter the title"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</group.Field>
					<group.Field name="description">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Description</FieldLabel>
									<Textarea
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Enter the description"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</group.Field>
					<group.Field name="tags">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Tags</FieldLabel>
									<InputTags
										id={field.name}
										name={field.name}
										tags={field.state.value ?? []}
										onBlur={field.handleBlur}
										onChange={(tags) => field.handleChange(tags)}
										aria-invalid={isInvalid}
										placeholder="Enter the tag"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</group.Field>
				</FieldSet>
				<FieldSet>
					<FieldLegend variant="label">Visibility</FieldLegend>
					<FieldDescription>
						By making this public, anyone can access it via public API.
					</FieldDescription>
					<FieldGroup>
						<group.Field name="public">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid} orientation="horizontal">
										<Checkbox
											id={field.name}
											name={field.name}
											aria-invalid={isInvalid}
											checked={field.state.value}
											onCheckedChange={(checked) => {
												if (checked === "indeterminate") {
													throw new Error("Should not be indeterminate");
												}
												field.handleChange(checked);
											}}
											data-invalid={isInvalid}
										/>
										<FieldLabel htmlFor={field.name}>
											Make this work public
										</FieldLabel>
									</Field>
								);
							}}
						</group.Field>
					</FieldGroup>
				</FieldSet>
			</FieldGroup>
		);
	},
});

type SelectedFilePreviewProps = {
	url: string | null;
};
export function SelectedFilePreview({ url }: SelectedFilePreviewProps) {
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
