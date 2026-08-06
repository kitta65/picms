import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import type { Message } from "../../domains/message/entity";
import { _TEST as MESSAGE_REPOSITORY_TEST } from "../../domains/message/repository";
import type { Revision } from "../../domains/revision/entity";
import type { Work } from "../../domains/work/entity";
import {
	configDatabase,
	_TEST as DRIZZLE_REPOSITORY_TEST,
	messageDatabase,
	workDatabase,
} from "./repositories";
import {
	configTable,
	messageTable,
	revisionTable,
	workTable,
	workTagTable,
} from "./tables";

const { DB, RevisionDatabase } = DRIZZLE_REPOSITORY_TEST;
const { FakeMessageDatabase } = MESSAGE_REPOSITORY_TEST;

describe("configDatabase", () => {
	beforeEach(async () => {
		await DB.delete(configTable);
	});

	describe("findFirst", () => {
		test("retuns undefined when empty", async () => {
			const result = await configDatabase.findFirst();
			expect(result).toBe(undefined);
		});

		test("return upserted value", async () => {
			const config = {
				timezone: "Asia/Tokyo",
			} as const;
			await configDatabase.upsert(config);
			const result = await configDatabase.findFirst();
			expect(result).toStrictEqual(config);
		});

		test("return last upserted value", async () => {
			const config1 = {
				timezone: "Asia/Tokyo",
			};
			await configDatabase.upsert(config1);

			const config2 = {
				timezone: "UTC",
			};
			await configDatabase.upsert(config2);
			const result = await configDatabase.findFirst();

			expect(result).toStrictEqual(config2);
		});
	});

	describe("upsert", () => {
		test("returns upserted value", async () => {
			const config = {
				timezone: "Asia/Tokyo",
			} as const;
			const result = await configDatabase.upsert(config);
			expect(result).toStrictEqual(config);
		});

		test("returns upserted value (null)", async () => {
			const config = {
				timezone: null,
			} as const;
			const result = await configDatabase.upsert(config);
			expect(result).toStrictEqual(config);
		});

		test("returns default value when invalid value is inserted", async () => {
			const config = {
				timezone: "Invalid/TimeZone",
			} as const;
			const result = await configDatabase.upsert(config);
			expect(result).toStrictEqual({ timezone: null });
		});
	});
});

const VALID_WORK: Work = {
	id: Bun.randomUUIDv7(),
	description: "this is description",
	title: "this is title",
	public: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("workDatabase", () => {
	beforeEach(async () => {
		await DB.delete(workTagTable);
		await DB.delete(workTable);
	});

	describe("findById", () => {
		test("returns undefined when unknown id is specified", async () => {
			const result = await workDatabase.findById(Bun.randomUUIDv7());
			expect(result).toBe(undefined);
		});

		test("returns specified entity", async () => {
			const id1 = Bun.randomUUIDv7();
			const id2 = Bun.randomUUIDv7();

			const work1: Work = { ...VALID_WORK, id: id1, title: "this is 1st work" };
			const work2: Work = { ...VALID_WORK, id: id2, title: "this is 2nd work" };

			await workDatabase.upsert(work1);
			await workDatabase.upsert(work2);

			const result1 = await workDatabase.findById(id1);
			const result2 = await workDatabase.findById(id2);

			expect(result1).toStrictEqual(work1);
			expect(result2).toStrictEqual(work2);
		});
	});

	describe("upsert", () => {
		test("returns upserted value", async () => {
			const result = await workDatabase.upsert(VALID_WORK);
			expect(result).toStrictEqual(VALID_WORK);
		});

		test("not null constraints are working", async () => {
			expect(async () => {
				// biome-ignore lint: intentional type error for test
				const id = null as any;
				const work: Work = {
					...VALID_WORK,
					id,
				};
				await workDatabase.upsert(work);
			}).toThrow();
		});
	});
});

const VALID_REVISION: Revision = {
	id: Bun.randomUUIDv7(),
	workId: Bun.randomUUIDv7(),
	createdAt: new Date(),
};

describe("revisionDatabase", () => {
	const messageDatabase = new FakeMessageDatabase();
	spyOn(messageDatabase, "insert").mockImplementation((m) => m);

	const revisionDatabase = new RevisionDatabase({
		messageDatabase,
	});

	beforeEach(async () => {
		await DB.delete(revisionTable);
	});

	describe("insert", () => {
		test("returns inserted value", async () => {
			const { data: result } = await revisionDatabase.insert(VALID_REVISION);
			expect(result).toStrictEqual(VALID_REVISION);
		});

		test("returns expected message", async () => {
			const { messages: results } =
				await revisionDatabase.insert(VALID_REVISION);
			expect(results.length).toBe(2);

			const revisionInsertedMessage = results.find(
				(res) => res.type === "REVISION_INSERTED",
			);
			expect(revisionInsertedMessage?.targetId).toBe(VALID_REVISION.id);

			const revisionSignedUrlExpiredMessage = results.find(
				(res) => res.type === "REVISION_SIGNED_URL_EXPIRED",
			);
			expect(revisionSignedUrlExpiredMessage?.targetId).toBe(VALID_REVISION.id);
			expect(
				revisionSignedUrlExpiredMessage?.createdAt.getTime(),
			).toBeLessThanOrEqual(Date.now());
			expect(
				revisionSignedUrlExpiredMessage?.scheduledAt.getTime(),
			).toBeGreaterThan(Date.now());
		});

		test("not null constraints are working", async () => {
			expect(async () => {
				// biome-ignore lint: intentional type error for test
				const id = null as any;
				const revision: Revision = {
					...VALID_REVISION,
					id,
				};
				await revisionDatabase.insert(revision);
			}).toThrow();
		});
	});

	describe("findById", () => {
		test("returns unspecified when unknown uuid is specified", async () => {
			const result = await revisionDatabase.findById(Bun.randomUUIDv7());
			expect(result).toBe(undefined);
		});

		test("returns specified revision", async () => {
			const id1 = Bun.randomUUIDv7();
			const id2 = Bun.randomUUIDv7();

			const revision1: Revision = { ...VALID_REVISION, id: id1 };
			const revision2: Revision = { ...VALID_REVISION, id: id2 };

			await revisionDatabase.insert(revision1);
			await revisionDatabase.insert(revision2);

			const result1 = await revisionDatabase.findById(id1);
			const result2 = await revisionDatabase.findById(id2);

			expect(result1).toStrictEqual(revision1);
			expect(result2).toStrictEqual(revision2);
		});
	});

	describe("deleteById", () => {
		test("deleted revision is not found", async () => {
			await revisionDatabase.insert(VALID_REVISION);
			const resultBeforeDelete = await revisionDatabase.findById(
				VALID_REVISION.id,
			);
			expect(resultBeforeDelete).toStrictEqual(VALID_REVISION);

			await revisionDatabase.deleteById(VALID_REVISION.id);
			const resultAfterDelete = await revisionDatabase.findById(
				VALID_REVISION.id,
			);
			expect(resultAfterDelete).toBe(undefined);
		});

		test("does not throw when unknown id is specified", () => {
			expect(async () => {
				const id = Bun.randomUUIDv7();
				await revisionDatabase.deleteById(id);
			}).not.toThrow();
		});
	});
});

const VALID_MESSAGE: Message = {
	id: Bun.randomUUIDv7(),
	type: "REVISION_INSERTED",
	attemptCount: 0,
	targetId: Bun.randomUUIDv7(),
	scheduledAt: new Date(),
	createdAt: new Date(),
};
describe("messageDatabase", () => {
	beforeEach(async () => {
		await DB.delete(messageTable);
	});

	describe("insert", () => {
		test("returns inserted value", async () => {
			const inserted = await messageDatabase.insert(VALID_MESSAGE);
			expect(inserted).toStrictEqual(VALID_MESSAGE);
		});
	});

	describe("attemptFirstN", () => {
		test("expected columns are updated", async () => {
			await messageDatabase.insert(VALID_MESSAGE);

			const tsBeforeAttempt = Date.now();
			const results = await messageDatabase.attemptFirstN({ limit: 1 });
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
			await messageDatabase.insert(message1);
			await messageDatabase.insert(message3);
			await messageDatabase.insert(message2);

			const results = await messageDatabase.attemptFirstN({ limit: 2 });
			expect(results.length).toBe(2);

			// the results that has created (not inserted) earlier should exist
			const result1 = results.find((res) => res.id === message1.id);
			expect(result1).toBeDefined();
			const result2 = results.find((res) => res.id === message2.id);
			expect(result2).toBeDefined();
		});

		test("future messages are ignored", async () => {
			await messageDatabase.insert({
				...VALID_MESSAGE,
				scheduledAt: new Date(2100, 0, 1),
			});

			const results = await messageDatabase.attemptFirstN({ limit: 1 });
			expect(results.length).toBe(0);
		});

		test("retryIntervalMinutes option is respected", async () => {
			await messageDatabase.insert(VALID_MESSAGE);
			const results = await messageDatabase.attemptFirstN({
				retryIntervalMinutes: 100,
			});
			const tsAfterAttempt = Date.now();
			expect(results.at(0)?.scheduledAt.getTime()).toBeGreaterThan(
				tsAfterAttempt,
			);
		});

		test("maxAttempts option is respected", async () => {
			const options = { maxAttempts: 2 };
			await messageDatabase.insert(VALID_MESSAGE);

			const results1 = await messageDatabase.attemptFirstN(options);
			expect(results1.length).toBe(1);

			const results2 = await messageDatabase.attemptFirstN(options);
			expect(results2.length).toBe(1);

			const results3 = await messageDatabase.attemptFirstN(options);
			expect(results3.length).toBe(0);
		});

		test("maxAttempts option is respected (default)", async () => {
			await messageDatabase.insert(VALID_MESSAGE);

			const results1 = await messageDatabase.attemptFirstN();
			expect(results1.length).toBe(1);

			const results2 = await messageDatabase.attemptFirstN();
			expect(results2.length).toBe(0);
		});
	});

	describe("deleteById", () => {
		test("does not throw when unknown id is specified", () => {
			expect(async () => {
				await messageDatabase.deleteById(Bun.randomUUIDv7());
			}).not.toThrow();
		});
	});
});
