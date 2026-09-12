import { useQuery } from "@tanstack/react-query";
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
