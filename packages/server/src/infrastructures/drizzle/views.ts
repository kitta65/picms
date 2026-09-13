import type { FindByIdInput, FindManyInput } from "../../features/work/io";
import type { IWorkView } from "../../features/work/view";
import { DB } from "./configs";

const FIND_MANY_HARD_LIMIT = 1000;

export const workView: IWorkView = {
	findById: async (input: FindByIdInput) => {
		const result = await DB.query.workTable.findFirst({
			with: {
				revisions: {
					columns: {
						id: true,
					},
					limit: 1,
					orderBy: { createdAt: "desc" },
				},
				tags: {
					columns: {
						name: true,
					},
				},
			},
			where: { id: input.id },
		});

		if (!result) {
			return;
		}

		const work = {
			...result,
			tags: result.tags.map((t) => t.name),
			revisionId: result.revisions.map((r) => r.id).at(0) ?? null,
		};
		return work;
	},
	findMany: async (input?: FindManyInput) => {
		let { limit, orderBy } = input ?? {};
		limit =
			limit && limit < FIND_MANY_HARD_LIMIT ? limit : FIND_MANY_HARD_LIMIT;
		orderBy = orderBy ?? { createdAt: "desc" };

		const result = await DB.query.workTable.findMany({
			with: {
				revisions: {
					columns: {
						id: true,
					},
					limit: 1,
					orderBy: { createdAt: "desc" },
				},
				tags: {
					columns: {
						name: true,
					},
				},
			},
			limit,
			orderBy,
		});

		if (!result) {
			return [];
		}

		const works = result.map((r) => ({
			...r,
			tags: r.tags.map((t) => t.name),
			revisionId: r.revisions.map((r) => r.id).at(0) ?? null,
		}));

		return works;
	},
};
