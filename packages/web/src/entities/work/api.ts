import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type * as workIo from "picms-server/features/work/io";
import { useContext } from "react";
import type { Work } from "@/entities/work/model";
import { ApiClientContext } from "@/shared/api";

export function useWorkQuery(id: string) {
	const client = useContext(ApiClientContext);

	return useQuery({
		queryKey: ["private", "works", id, "get"],
		queryFn: async (): Promise<Work> => {
			const res = await client.api.private.works[":id"].$get({ param: { id } });
			const json = await res.json();
			const work: Work = {
				...json,
				createdAt: new Date(json.createdAt),
				updatedAt: new Date(json.updatedAt),
			};
			return work;
		},
	});
}

export function useWorksQuery() {
	const client = useContext(ApiClientContext);

	return useQuery({
		queryKey: ["private", "works", "get"],
		queryFn: async (): Promise<Work[]> => {
			const resp = await client.api.private.works.$get({ query: {} });
			const json = await resp.json();
			const works = json.map((j) => ({
				...j,
				createdAt: new Date(j.createdAt),
				updatedAt: new Date(j.updatedAt),
			}));
			return works;
		},
	});
}

export function useWorkUpdate() {
	const client = useContext(ApiClientContext);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: workIo.UpdateInput) => {
			const result = await client.api.private.works[":id"].$post({
				json: input,
				param: { id: input.id },
			});
			queryClient.invalidateQueries({ queryKey: ["private", "works"] });
			return result;
		},
	});
}

export function useWorkCreation() {
	const client = useContext(ApiClientContext);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: workIo.CreateInput) => {
			const result = await client.api.private.works.$post({
				json: input,
			});
			queryClient.invalidateQueries({ queryKey: ["private", "works"] });
			return result;
		},
	});
}

export function useWorkDeletion() {
	const client = useContext(ApiClientContext);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (workId: Work["id"]) => {
			const result = await client.api.private.works[":id"].$delete({
				param: { id: workId },
			});
			queryClient.invalidateQueries({ queryKey: ["private", "works"] });
			return result;
		},
	});
}
