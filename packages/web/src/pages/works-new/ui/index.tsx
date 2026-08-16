import { useForm } from "@tanstack/react-form";
import { useSelector } from "@tanstack/react-store";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { handleSubmitWorksNewInput } from "@/pages/works-new/api";
import { WORKS_NEW_INPUT_SCHEMA } from "@/pages/works-new/model";
import { Preview } from "@/pages/works-new/ui/preview";
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

export function WorksNew() {
	const form = useForm({
		defaultValues: {
			file: null as File | null,
			title: "",
			description: "",
			public: false,
		},
		validators: {
			onSubmit: WORKS_NEW_INPUT_SCHEMA,
		},
		onSubmit: async ({ value }) => {
			await handleSubmitWorksNewInput(WORKS_NEW_INPUT_SCHEMA.parse(value), {
				onSuccess: () => toast.success("Saved!"),
				onError: () => toast.error("Something Went Wrong."),
			});
		},
	});

	const file = useSelector(form.store, (state) => state.values.file);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	useEffect(() => {
		if (!file) {
			setPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

	return (
		<form
			className="w-full max-w-200"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<Preview url={previewUrl} />
			<FieldGroup>
				<FieldSet>
					<form.Field name="file">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>File</FieldLabel>
									<Input
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
					<InputTags />
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
										<FieldLabel>Make this work public</FieldLabel>
									</Field>
								);
							}}
						</form.Field>
					</FieldGroup>
				</FieldSet>
			</FieldGroup>
			<div className="flex items-center justify-center gap-x-4">
				<Button variant="outline" type="button" onClick={() => form.reset()}>
					Reset
				</Button>
				<Button type="submit">Submit</Button>
			</div>
		</form>
	);
}
