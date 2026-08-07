import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import type { PicmsApi } from "picms-server/api";
import {
	UPSERT_INPUT_SCHEMA,
	type UpsertInput,
} from "picms-server/features/config/io";
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

const CLIENT = hc<PicmsApi>(window.location.origin);

function useConfigQuery() {
	return useQuery({
		// TODO: refactor
		queryKey: ["config", "get"],
		queryFn: async () => {
			const res = await CLIENT.api.private.configs.$get();
			return res.json();
		},
	});
}

function useConfigMutation(onSuccess?: () => void) {
	return useMutation({
		mutationFn: (config: UpsertInput) =>
			CLIENT.api.private.configs.$post({ json: config }),
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
	const { data: config, isLoading, mutate } = useConfigOperation();
	const defaultValues: UpsertInput = {
		timezone: null,
	} as const;
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
