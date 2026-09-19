import { and, eq, notInArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { ERROR_CODE } from "../../../constants";
import { MESSAGE_SCHEMA, Message } from "../../../domains/message/entity";
import type { Work } from "../../../domains/work/entity";
import type { IWorkDatabase } from "../../../domains/work/repository";
import { DB } from "../configs";
import { messageTable, workTable, workTagTable } from "../tables";

export const workDatabase: IWorkDatabase = {
	findById: async (id: Work["id"]) => {
		const result = await DB.query.workTable.findFirst({
			with: {
				tags: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
			where: {
				id,
			},
		});

		if (!result) {
			return;
		}

		return { ...result, tags: result.tags.toSorted().map((t) => t.name) };
	},

	update: async (work: Parameters<IWorkDatabase["update"]>[0]) => {
		const dt = new Date();
		await DB.transaction(async (tx) => {
			await tx
				.update(workTable)
				.set(work)
				.where(eq(workTable.id, work.id))
				.returning();
			if (!work.tags) {
				return;
			}
			// NOTE: drizzle does not support MERGE statement
			if (work.tags.length !== 0) {
				await tx
					.insert(workTagTable)
					.values(
						work.tags.map((t) => ({
							id: Bun.randomUUIDv7(),
							workId: work.id,
							name: t,
							createdAt: dt,
						})),
					)
					.onConflictDoNothing()
					.returning();
			}
			await tx
				.delete(workTagTable)
				.where(
					and(
						eq(workTagTable.workId, work.id),
						notInArray(workTagTable.name, work.tags),
					),
				);
		});

		const found = await workDatabase.findById(work.id);
		if (!found) {
			const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
			throw new HTTPException(status, { message });
		}
		return found;
	},

	insert: async (work: Work) => {
		const dt = new Date();
		await DB.transaction(async (tx) => {
			await tx.insert(workTable).values(work).returning();
			if (work.tags.length === 0) {
				return;
			}
			await tx
				.insert(workTagTable)
				.values(
					work.tags.map((t) => ({
						id: Bun.randomUUIDv7(),
						workId: work.id,
						name: t,
						createdAt: dt,
					})),
				)
				.onConflictDoNothing()
				.returning();
		});
		const found = await workDatabase.findById(work.id);
		if (!found) {
			const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
			throw new HTTPException(status, { message });
		}
		return found;
	},
	deleteById: async (id: Parameters<IWorkDatabase["deleteById"]>[0]) => {
		const message = Message.create({
			type: "WORK_DELETED",
			targetId: id,
		});
		const result_ = await DB.transaction(async (tx) => {
			await tx.delete(workTagTable).where(eq(workTagTable.workId, id));
			await tx.delete(workTable).where(eq(workTable.id, id));
			const messages = await tx
				.insert(messageTable)
				.values(message)
				.returning();
			return {
				data: null,
				messages,
			};
		});
		const result = {
			...result_,
			messages: result_.messages.map((m) => MESSAGE_SCHEMA.parse(m)),
		};
		return result;
	},
};
