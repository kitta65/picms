import { defineRelations } from "drizzle-orm";
import { revisionTable, workTable, workTagTable } from "./tables";

export const RELATIONS = defineRelations(
	{ workTable, workTagTable, revisionTable },
	(r) => ({
		workTable: {
			tags: r.many.workTagTable(),
			revisions: r.many.revisionTable(),
		},
		workTagTable: {
			work: r.one.workTable({
				from: r.workTagTable.workId,
				to: r.workTable.id,
			}),
		},
		revisionTable: {
			work: r.one.workTable({
				from: r.revisionTable.workId,
				to: r.workTable.id,
			}),
		},
	}),
);
