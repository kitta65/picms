import { beforeEach, describe, expect, test } from "bun:test";
import { _TEST as EVENT_REPOSITORY_TEST } from "../../domains/event/repository";
import type { Revision } from "../../domains/revision/entity";
import type { Work } from "../../domains/work/entity";
import {
	configDatabase,
	_TEST as DRIZZLE_REPOSITORY_TEST,
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
const { EventDatabaseForTest } = EVENT_REPOSITORY_TEST;

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
		eventDatabase: new EventDatabaseForTest({ insert: (e) => e }),
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

		test("do not throw when unknown id is specified", () => {
			expect(async () => {
				const id = Bun.randomUUIDv7();
				await revisionDatabase.deleteById(id);
			}).not.toThrow();
		});
	});
});

describe("eventDatabase", () => {
	beforeEach(async () => {
		await DB.delete(eventTable);
	});
	describe("attemptFirstN", () => {
		// TODO
	});
	describe("deleteById", () => {
		// TODO
	});
});
