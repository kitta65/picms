import { beforeEach, describe, expect, test } from "bun:test";
import type { Message } from "../../../domains/message/entity";
import { DB } from "../configs";
import { messageTable } from "../tables";
import { messageBroker } from "./message-broker";

const VALID_MESSAGE: Message = {
	id: Bun.randomUUIDv7(),
	type: "REVISION_INSERTED",
	attemptCount: 0,
	targetId: Bun.randomUUIDv7(),
	scheduledAt: new Date(),
	createdAt: new Date(),
};

describe("messageBroker", () => {
	beforeEach(async () => {
		await DB.delete(messageTable);
	});

	describe("publish", () => {
		test("returns published value", async () => {
			const published = await messageBroker.publish(VALID_MESSAGE);
			expect(published).toStrictEqual(VALID_MESSAGE);
		});
	});

	describe("pull", () => {
		test("expected columns are updated", async () => {
			await messageBroker.publish(VALID_MESSAGE);

			const tsBeforeAttempt = Date.now();
			const results = await messageBroker.pull({ limit: 1 });
			const tsAfterAttempt = Date.now();
			expect(results.length).toBe(1);

			const result = results.at(0);
			expect(result?.attemptCount).toBe(VALID_MESSAGE.attemptCount + 1);
			expect(result?.scheduledAt.getTime()).toBeGreaterThanOrEqual(
				tsBeforeAttempt,
			);
			expect(result?.scheduledAt.getTime()).toBeLessThanOrEqual(tsAfterAttempt);
		});

		test("messages are fetced by expected order", async () => {
			const message1 = {
				...VALID_MESSAGE,
				id: Bun.randomUUIDv7(),
				scheduledAt: new Date(),
			};
			const message2 = {
				...VALID_MESSAGE,
				id: Bun.randomUUIDv7(),
				scheduledAt: new Date(),
			};
			const message3 = {
				...VALID_MESSAGE,
				id: Bun.randomUUIDv7(),
				scheduledAt: new Date(),
			};

			// inserted in random order
			await messageBroker.publish(message1);
			await messageBroker.publish(message3);
			await messageBroker.publish(message2);

			const results = await messageBroker.pull({ limit: 2 });
			expect(results.length).toBe(2);

			// the results that has created (not inserted) earlier should exist
			const result1 = results.find((res) => res.id === message1.id);
			expect(result1).toBeDefined();
			const result2 = results.find((res) => res.id === message2.id);
			expect(result2).toBeDefined();
		});

		test("future messages are ignored", async () => {
			await messageBroker.publish({
				...VALID_MESSAGE,
				scheduledAt: new Date(2100, 0, 1),
			});

			const results = await messageBroker.pull({ limit: 1 });
			expect(results.length).toBe(0);
		});

		test("retryIntervalMinutes option is respected", async () => {
			await messageBroker.publish(VALID_MESSAGE);
			const results = await messageBroker.pull({
				retryIntervalMinutes: 100,
			});
			const tsAfterAttempt = Date.now();
			expect(results.at(0)?.scheduledAt.getTime()).toBeGreaterThan(
				tsAfterAttempt,
			);
		});

		test("maxAttempts option is respected", async () => {
			const options = { maxAttempts: 2 };
			await messageBroker.publish(VALID_MESSAGE);

			const results1 = await messageBroker.pull(options);
			expect(results1.length).toBe(1);

			const results2 = await messageBroker.pull(options);
			expect(results2.length).toBe(1);

			const results3 = await messageBroker.pull(options);
			expect(results3.length).toBe(0);
		});

		test("maxAttempts option is respected (default)", async () => {
			await messageBroker.publish(VALID_MESSAGE);

			const results1 = await messageBroker.pull();
			expect(results1.length).toBe(1);

			const results2 = await messageBroker.pull();
			expect(results2.length).toBe(0);
		});
	});

	describe("ack", () => {
		test("does not throw when unknown id is specified", async () => {
			try {
				await messageBroker.ack(Bun.randomUUIDv7());
			} catch {
				expect.unreachable();
			}
		});
	});
});
