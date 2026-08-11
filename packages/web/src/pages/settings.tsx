import { useForm } from "@tanstack/react-form";
import {
	UPSERT_INPUT_SCHEMA,
	type UpsertInput,
} from "picms-server/features/config/io";
import { useEffect } from "react";
import { useConfigOperation } from "@/entities/config/api";
import { SomethingWentWrong } from "@/shared/ui/custom/something-went-wrong";
import { Button } from "@/shared/ui/shadcn/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/shared/ui/shadcn/combobox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/shared/ui/shadcn/field";

export function Settings() {
	const { data: config, isBusy, isError, mutate } = useConfigOperation();
	const defaultValues: UpsertInput = {
		timezone: null,
	};
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: UPSERT_INPUT_SCHEMA,
		},
		onSubmit: ({ value }) => {
			mutate(value);
		},
	});

	useEffect(() => {
		// do nothing if current config does not exist
		if (!config) return;

		// supported values may change in the future
		if (
			!Intl.supportedValuesOf("timeZone").some((tz) => tz === config.timezone)
		) {
			form.reset({ ...config, timezone: null });
			return;
		}

		form.reset(config);
	}, [config, form]);

	if (isError) {
		return <SomethingWentWrong />;
	}

	return (
		<form
			className="w-full max-w-200"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Field name="timezone">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid} orientation="horizontal">
								<FieldContent>
									<FieldLabel htmlFor={field.name}>Timezone</FieldLabel>
									<FieldDescription>Select a timezone.</FieldDescription>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</FieldContent>

								<Combobox
									items={Intl.supportedValuesOf("timeZone")}
									name={field.name}
									value={field.state.value}
									onValueChange={(val) => field.handleChange(val)}
								>
									<ComboboxInput placeholder="Select a timezone" />
									<ComboboxContent>
										<ComboboxEmpty>No items found.</ComboboxEmpty>
										<ComboboxList>
											{(item) => (
												<ComboboxItem key={item} value={item}>
													{item}
												</ComboboxItem>
											)}
										</ComboboxList>
									</ComboboxContent>
								</Combobox>
							</Field>
						);
					}}
				</form.Field>

				<div className="flex items-center justify-center gap-x-4">
					<Button
						variant="outline"
						type="button"
						onClick={() => form.reset()}
						disabled={isBusy}
					>
						Reset
					</Button>
					<Button type="submit" disabled={isBusy}>
						Submit
					</Button>
				</div>
			</FieldGroup>
		</form>
	);
}
