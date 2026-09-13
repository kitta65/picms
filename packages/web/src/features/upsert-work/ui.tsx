import { useSelector } from "@tanstack/react-store";
import { useEffect, useRef } from "react";
import type {
	CreateWorkInput,
	UpdateWorkInput,
} from "@/features/upsert-work/model";
import { withFieldGroup } from "@/shared/lib/form";
import { ContextualHelp } from "@/shared/ui/custom/contextual-help";
import { InputTags } from "@/shared/ui/custom/input-tags";
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

type DefaultValues = Pick<
	CreateWorkInput | UpdateWorkInput,
	keyof CreateWorkInput & keyof UpdateWorkInput
>;

const DEFALUT_VALUES: DefaultValues = {
	file: null,
	title: "",
	description: "",
	public: false,
	tags: [],
};

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
	defaultValues: DEFALUT_VALUES,
	props: {
		isCreate: false,
	},
	render: ({ group, isCreate }) => {
		const fileInputRef = useRef<HTMLInputElement>(null);
		const file = useSelector(group.store, (state) => state.values.file);
		useEffect(() => {
			if (!file && fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}, [file]);

		return (
			<FieldGroup>
				<group.Subscribe selector={(state) => state.values.file}>
					{(file) => (
						<ClearFileInputOnReset file={file} fileInputRef={fileInputRef} />
					)}
				</group.Subscribe>
				<FieldSet>
					<group.AppField name="file">
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
					</group.AppField>
					<group.AppField name="title">
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
					</group.AppField>
					<group.AppField name="description">
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
					</group.AppField>
					<group.AppField name="tags">
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
					</group.AppField>
				</FieldSet>
				<FieldSet>
					<FieldLegend variant="label">Visibility</FieldLegend>
					<FieldDescription>
						By making this public, anyone can access it via public API.
					</FieldDescription>
					<FieldGroup>
						<group.AppField name="public">
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
						</group.AppField>
					</FieldGroup>
				</FieldSet>
			</FieldGroup>
		);
	},
});
