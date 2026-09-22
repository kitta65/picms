import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { MESSAGE_SCHEMA } from "../../../domains/message/entity";
import type { IMessageBroker } from "../../../domains/message/repository";
import { DB } from "../configs";
import { messageTable } from "../tables";

export const messageBroker: IMessageBroker = {
	publish: async (message: Parameters<IMessageBroker["publish"]>[0]) => {
		const results = await DB.insert(messageTable).values(message).returning();
		const inserted = results.at(0);

		if (!inserted) {
			throw new Error("something went wrong");
		}

		const parsed = MESSAGE_SCHEMA.parse(inserted);
		return parsed;
	},

	pull: async (options?: Parameters<IMessageBroker["pull"]>[0]) => {
		const limit = options?.limit;
		const nextScheduledAt = new Date();
		nextScheduledAt.setMinutes(
			nextScheduledAt.getMinutes() + (options?.retryIntervalMinutes ?? 0),
		);

		// transaction is required because update statement does not support order by clause
		const results = await DB.transaction(async (tx) => {
			// select
			const query = tx
				.select()
				.from(messageTable)
				.where(
					and(
						lt(messageTable.attemptCount, options?.maxAttempts ?? 1),
						lt(messageTable.scheduledAt, new Date()),
					),
				)
				.orderBy(messageTable.scheduledAt, messageTable.id);
			const shouldLimit = limit !== undefined;
			const selectResults = await (shouldLimit ? query.limit(limit) : query);

			// update
			const updateResults = await tx
				.update(messageTable)
				.set({
					scheduledAt: nextScheduledAt,
					attemptCount: sql`${messageTable.attemptCount} + 1`,
				})
				.where(
					inArray(
						messageTable.id,
						selectResults.map((res) => res.id),
					),
				)
				.returning();
			return updateResults;
		});
		const messages = results.map((res) => MESSAGE_SCHEMA.parse(res));
		return messages;
	},

	ack: async (id: Parameters<IMessageBroker["ack"]>[0]) => {
		await DB.delete(messageTable).where(and(eq(messageTable.id, id)));
	},
};
