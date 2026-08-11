import { useMutation, useQuery } from "@tanstack/react-query";
import type { UpsertInput } from "picms-server/features/config/io";
import { useContext } from "react";
import type { Config } from "@/entities/config/model";
import { ApiClientContext, ApiError } from "@/shared/api";

function useConfigQuery() {
	const client = useContext(ApiClientContext);

	return useQuery({
		queryKey: ["private", "configs", "get"],
		queryFn: async (): Promise<Config> => {
			const res = await client.api.private.configs.$get();
			return res.json();
		},
	});
}

function useConfigMutation(onSuccess?: () => void) {
	const client = useContext(ApiClientContext);

	return useMutation({
		mutationFn: async (config: UpsertInput) => {
			const res = await client.api.private.configs.$post({ json: config });
			if (res.ok) {
				return res.json();
			} else {
				throw new ApiError(res);
			}
		},
		onSuccess,
	});
}

export function useConfigOperation() {
	const { data, isError, isLoading, refetch } = useConfigQuery();
	const { mutate, mutateAsync, isPending } = useConfigMutation(() => refetch());

	return {
		data,
		isBusy: isLoading || isPending,
		isError,
		refetch,
		mutate,
		mutateAsync,
	};
}
