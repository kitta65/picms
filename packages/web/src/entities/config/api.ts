import { useMutation, useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import type { PicmsApi } from "picms-server/api";
import type { UpsertInput } from "picms-server/features/config/io";
import type { Config } from "@/entities/config/model";

const CLIENT = hc<PicmsApi>(window.location.origin);

function useConfigQuery() {
	return useQuery({
		// TODO: refactor
		queryKey: ["private", "configs", "get"],
		queryFn: async (): Promise<Config> => {
			const res = await CLIENT.api.private.configs.$get();
			CLIENT.api.private.configs.$url;
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

export function useConfigOperation() {
	const { data, isError, isLoading, refetch } = useConfigQuery();
	const { mutate, isPending } = useConfigMutation(() => refetch());

	return {
		data,
		isBusy: isLoading || isPending,
		isError,
		refetch,
		mutate,
	};
}
