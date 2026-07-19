import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import type { PrivateApi } from "picms-server/api";
import {
	type Config,
	configInputSchema,
} from "picms-server/domain/config/entity";
import { useEffect } from "react";
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

function useConfigQuery() {
	return useQuery({
		// TODO: refactor
		queryKey: ["config", "get"],
		queryFn: () => CLIENT.api.private.config.$get(),
	});
}

function useConfigMutation(onSuccess?: () => void) {
	return useMutation({
		mutationFn: (config: Config) =>
			CLIENT.api.private.config.$post({ json: config }),
		onSuccess,
	});
}

function useConfigOperation() {
	const { data, isLoading, refetch } = useConfigQuery();
	const { mutate } = useConfigMutation(() => refetch());

	return {
		data,
		isLoading,
		refetch,
		mutate,
	};
}

export function Settings() {
	// TODO: handle isError
	const { data, isLoading, mutate } = useConfigOperation();
	const form = useForm({
		defaultValues: {
			timezone: "",
		},
		validators: {
			onSubmit: configInputSchema,
		},
		onSubmit: ({ value }) => {
			mutate(value);
		},
	});

	useEffect(() => {
		// do nothing if current config does not exist
		if (!data) return;

		const config = data.json();

		config.then((c) => {
			// supported values may change in the future
			if (!(c.timezone in Intl.supportedValuesOf("timeZone"))) {
				form.reset({ ...c, timezone: "" });
				return;
			}

			form.reset(c);
		});
	}, [data, form]);

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
			</FieldGroup>
		</form>
	);
}
