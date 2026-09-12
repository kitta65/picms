import { useForm } from "@tanstack/react-form";
import { useSelector } from "@tanstack/react-store";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { navigate } from "wouter/use-browser-location";
import { RevisionImage } from "@/entities/revision/ui";
import { useWorkQuery } from "@/entities/work/api";
import { handleSubmitWorksEditInput } from "@/pages/works-edit/api";
import {
	WORKS_EDIT_INPUT_SCHEMA,
	type WorksEditInput,
} from "@/pages/works-edit/model";
import { ApiClientContext } from "@/shared/api";
import { ROUTE } from "@/shared/config";
import { ContextualHelp } from "@/shared/ui/custom/contextual-help";
import { InputTags } from "@/shared/ui/custom/input-tags";
import { Button } from "@/shared/ui/shadcn/button";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";
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

type WorksEditProps = {
	workId: string;
};
export function WorksEdit({ workId }: WorksEditProps) {
	const { data: work, isLoading } = useWorkQuery(workId);
	const client = useContext(ApiClientContext);
	const defaultValues: WorksEditInput = {
		id: workId,
		file: null,
		title: "",
		tags: [],
		description: "",
		public: false,
	};
	const form = useForm({
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
	useEffect(() => {
		if (!work || isLoading) {
			return;
		}
		form.reset({ ...work, file: null });
	}, [work, isLoading, form]);

	const file = useSelector(form.store, (state) => state.values.file);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	useEffect(() => {
		if (!file) {
			setPreviewUrl(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			return;
		}
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

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
			<FieldGroup>
				<FieldSet>
					<form.Field name="file">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<div className="flex items-center gap-x-1">
										<FieldLabel htmlFor={field.name}>File</FieldLabel>
										<ContextualHelp
											title="Not required"
											description="Choose a file only if you want to upload a new file."
										/>
									</div>
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
					</form.Field>
					<form.Field name="title">
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
					</form.Field>
					<form.Field name="description">
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
					</form.Field>
					<form.Field name="tags">
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
					</form.Field>
				</FieldSet>
				<FieldSet>
					<FieldLegend variant="label">Visibility</FieldLegend>
					<FieldDescription>
						By making this public, anyone can access it via public API.
					</FieldDescription>
					<FieldGroup>
						<form.Field name="public">
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
						</form.Field>
					</FieldGroup>
				</FieldSet>
			</FieldGroup>
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
