import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import type { Work } from "@/entities/work/model";
import { ApiClientContext } from "@/shared/api";

export function useWorkQuery() {
	const client = useContext(ApiClientContext);

	return useQuery({
		queryKey: ["private", "configs", "get"],
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
