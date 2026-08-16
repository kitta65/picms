import { defineRelations } from "drizzle-orm";
import { workTable, workTagTable } from "./tables";

export const RELATIONS = defineRelations({ workTable, workTagTable }, (r) => ({
	workTable: {
		tags: r.many.workTagTable(),
	},
	workTagTable: {
		work: r.one.workTable({
			from: r.workTagTable.workId,
			to: r.workTable.id,
		}),
	},
}));
