import { beforeEach, describe, expect, test } from "bun:test";
import type { Event } from "../../domains/event/entity";
import { _TEST as EVENT_REPOSITORY_TEST } from "../../domains/event/repository";
import type { Revision } from "../../domains/revision/entity";
import type { Work } from "../../domains/work/entity";
import {
	configDatabase,
	_TEST as DRIZZLE_REPOSITORY_TEST,
	eventDatabase,
	workDatabase,
} from "./repositories";
import {
	configTable,
	eventTable,
	revisionTable,
	workTable,
	workTagTable,
} from "./tables";

const { DB, RevisionDatabase } = DRIZZLE_REPOSITORY_TEST;
const { EventDatabaseStub } = EVENT_REPOSITORY_TEST;

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
	const revisionDatabase = new RevisionDatabase({
		eventDatabase: new EventDatabaseStub({ insert: (e) => e }),
	});

	beforeEach(async () => {
		await DB.delete(revisionTable);
	});

	describe("insert", () => {
		test("returns inserted value", async () => {
			const { data: result } = await revisionDatabase.insert(VALID_REVISION);
			expect(result).toStrictEqual(VALID_REVISION);
		});

		test("returns expected event", async () => {
			const { events: results } = await revisionDatabase.insert(VALID_REVISION);
			expect(results.length).toBe(2);

			const revisionInsertedEvent = results.find(
				(res) => res.type === "REVISION_INSERTED",
			);
			expect(revisionInsertedEvent?.targetId).toBe(VALID_REVISION.id);

			const revisionSignedUrlExpiredEvent = results.find(
				(res) => res.type === "REVISION_SIGNED_URL_EXPIRED",
			);
			expect(revisionSignedUrlExpiredEvent?.targetId).toBe(VALID_REVISION.id);
			expect(
				revisionSignedUrlExpiredEvent?.createdAt.getTime(),
			).toBeLessThanOrEqual(Date.now());
			expect(
				revisionSignedUrlExpiredEvent?.scheduledAt.getTime(),
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

const VALID_EVENT: Event = {
	id: Bun.randomUUIDv7(),
	type: "REVISION_INSERTED",
	attemptCount: 0,
	targetId: Bun.randomUUIDv7(),
	scheduledAt: new Date(),
	createdAt: new Date(),
};
describe("eventDatabase", () => {
	beforeEach(async () => {
		await DB.delete(eventTable);
	});

	describe("insert", () => {
		test("returns inserted value", async () => {
			const inserted = await eventDatabase.insert(VALID_EVENT);
			expect(inserted).toStrictEqual(VALID_EVENT);
		});
	});

	describe("attemptFirstN", () => {
		test("expected columns are updated", async () => {
			await eventDatabase.insert(VALID_EVENT);

			const tsBeforeAttempt = Date.now();
			const results = await eventDatabase.attemptFirstN({ limit: 1 });
			const tsAfterAttempt = Date.now();
			expect(results.length).toBe(1);

			const result = results.at(0);
			expect(result?.attemptCount).toBe(VALID_EVENT.attemptCount + 1);
			expect(result?.scheduledAt.getTime()).toBeGreaterThanOrEqual(
				tsBeforeAttempt,
			);
			expect(result?.scheduledAt.getTime()).toBeLessThanOrEqual(tsAfterAttempt);
		});

		test("events are fetced by expected order", async () => {
			const event1 = {
				...VALID_EVENT,
				id: Bun.randomUUIDv7(),
				scheduledAt: new Date(),
			};
			const event2 = {
				...VALID_EVENT,
				id: Bun.randomUUIDv7(),
				scheduledAt: new Date(),
			};
			const event3 = {
				...VALID_EVENT,
				id: Bun.randomUUIDv7(),
				scheduledAt: new Date(),
			};

			// inserted in random order
			await eventDatabase.insert(event1);
			await eventDatabase.insert(event3);
			await eventDatabase.insert(event2);

			const results = await eventDatabase.attemptFirstN({ limit: 2 });
			expect(results.length).toBe(2);

			// the results that has created (not inserted) earlier should exist
			const result1 = results.find((res) => res.id === event1.id);
			expect(result1).toBeDefined();
			const result2 = results.find((res) => res.id === event2.id);
			expect(result2).toBeDefined();
		});

		test("future events are ignored", async () => {
			await eventDatabase.insert({
				...VALID_EVENT,
				scheduledAt: new Date(2100, 0, 1),
			});

			const results = await eventDatabase.attemptFirstN({ limit: 1 });
			expect(results.length).toBe(0);
		});

		test("retryIntervalMinutes option is respected", async () => {
			await eventDatabase.insert(VALID_EVENT);
			const results = await eventDatabase.attemptFirstN({
				retryIntervalMinutes: 100,
			});
			const tsAfterAttempt = Date.now();
			expect(results.at(0)?.scheduledAt.getTime()).toBeGreaterThan(
				tsAfterAttempt,
			);
		});

		test("maxAttempts option is respected", async () => {
			const options = { maxAttempts: 2 };
			await eventDatabase.insert(VALID_EVENT);

			const results1 = await eventDatabase.attemptFirstN(options);
			expect(results1.length).toBe(1);

			const results2 = await eventDatabase.attemptFirstN(options);
			expect(results2.length).toBe(1);

			const results3 = await eventDatabase.attemptFirstN(options);
			expect(results3.length).toBe(0);
		});

		test("maxAttempts option is respected (default)", async () => {
			await eventDatabase.insert(VALID_EVENT);

			const results1 = await eventDatabase.attemptFirstN();
			expect(results1.length).toBe(1);

			const results2 = await eventDatabase.attemptFirstN();
			expect(results2.length).toBe(0);
		});
	});

	describe("deleteById", () => {
		test("does not throw when unknown id is specified", () => {
			expect(async () => {
				await eventDatabase.deleteById(Bun.randomUUIDv7());
			}).not.toThrow();
		});
	});
});
