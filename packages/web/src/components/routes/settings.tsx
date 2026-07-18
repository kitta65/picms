import { useForm } from "@tanstack/react-form";
import { hc } from "hono/client";

import type { PrivateApi } from "picms-server/api";
import { configInputSchema } from "picms-server/domain/config/entity";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";

import { Button } from "../ui/button";

const CLIENT = hc<PrivateApi>(window.location.origin);

export function Settings() {
	const form = useForm({
		defaultValues: {
			timezone: "",
		},
		validators: {
			onSubmit: configInputSchema,
		},
		onSubmit: ({ value }) => {
			CLIENT.api.private.config.$post({ json: value });
		},
	});
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
									onValueChange={(val) => field.handleChange(val ?? "")}
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
					<Button variant="outline" type="button" onClick={() => form.reset()}>
						Reset
					</Button>
					<Button type="submit">Submit</Button>
				</div>
			</FieldGroup>
		</form>
	);
}
