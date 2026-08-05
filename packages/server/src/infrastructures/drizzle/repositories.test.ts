import { beforeEach, describe, expect, test } from "bun:test";
import type { Revision } from "../../domains/revision/entity";
import type { Work } from "../../domains/work/entity";
import * as DrizzleRepositories from "./repositories";
import * as DrizzleTables from "./tables";

const { DB } = DrizzleRepositories._TEST;

describe("configDatabase", () => {
	beforeEach(async () => {
		await DB.delete(DrizzleTables.configTable);
	});

	describe("findFirst", () => {
		test("retuns undefined when empty", async () => {
			const result = await DrizzleRepositories.configDatabase.findFirst();
			expect(result).toBe(undefined);
		});

		test("return upserted value", async () => {
			const config = {
				timezone: "Asia/Tokyo",
			} as const;
			await DrizzleRepositories.configDatabase.upsert(config);
			const result = await DrizzleRepositories.configDatabase.findFirst();
			expect(result).toStrictEqual(config);
		});

		test("return last upserted value", async () => {
			const config1 = {
				timezone: "Asia/Tokyo",
			};
			await DrizzleRepositories.configDatabase.upsert(config1);

			const config2 = {
				timezone: "UTC",
			};
			await DrizzleRepositories.configDatabase.upsert(config2);
			const result = await DrizzleRepositories.configDatabase.findFirst();

			expect(result).toStrictEqual(config2);
		});
	});

	describe("upsert", () => {
		test("returns upserted value", async () => {
			const config = {
				timezone: "Asia/Tokyo",
			} as const;
			const result = await DrizzleRepositories.configDatabase.upsert(config);
			expect(result).toStrictEqual(config);
		});

		test("returns upserted value (null)", async () => {
			const config = {
				timezone: null,
			} as const;
			const result = await DrizzleRepositories.configDatabase.upsert(config);
			expect(result).toStrictEqual(config);
		});

		test("returns default value when invalid value is inserted", async () => {
			const config = {
				timezone: "Invalid/TimeZone",
			} as const;
			const result = await DrizzleRepositories.configDatabase.upsert(config);
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
		await DB.delete(DrizzleTables.workTagTable);
		await DB.delete(DrizzleTables.workTable);
	});

	describe("findById", () => {
		test("returns undefined when unknown id is specified", async () => {
			const result = await DrizzleRepositories.workDatabase.findById(
				Bun.randomUUIDv7(),
			);
			expect(result).toBe(undefined);
		});

		test("returns specified entity", async () => {
			const id1 = Bun.randomUUIDv7();
			const id2 = Bun.randomUUIDv7();

			const work1: Work = { ...VALID_WORK, id: id1, title: "this is 1st work" };
			const work2: Work = { ...VALID_WORK, id: id2, title: "this is 2nd work" };

			await DrizzleRepositories.workDatabase.upsert(work1);
			await DrizzleRepositories.workDatabase.upsert(work2);

			const result1 = await DrizzleRepositories.workDatabase.findById(id1);
			const result2 = await DrizzleRepositories.workDatabase.findById(id2);

			expect(result1).toStrictEqual(work1);
			expect(result2).toStrictEqual(work2);
		});
	});

	describe("upsert", () => {
		test("returns upserted value", async () => {
			const result = await DrizzleRepositories.workDatabase.upsert(VALID_WORK);
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
				await DrizzleRepositories.workDatabase.upsert(work);
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
	beforeEach(async () => {
		await DB.delete(DrizzleTables.revisionTable);
	});

	describe("insert", () => {
		test("returns inserted value", async () => {
			const result =
				await DrizzleRepositories.revisionDatabase.insert(VALID_REVISION);
			expect(result).toStrictEqual(VALID_REVISION);
		});

		test("not null constraints are working", async () => {
			expect(async () => {
				// biome-ignore lint: intentional type error for test
				const id = null as any;
				const revision: Revision = {
					...VALID_REVISION,
					id,
				};
				await DrizzleRepositories.revisionDatabase.insert(revision);
			}).toThrow();
		});
	});

	describe("findById", () => {
		test("returns unspecified when unknown uuid is specified", async () => {
			const result = await DrizzleRepositories.revisionDatabase.findById(
				Bun.randomUUIDv7(),
			);
			expect(result).toBe(undefined);
		});

		test("returns specified revision", async () => {
			const id1 = Bun.randomUUIDv7();
			const id2 = Bun.randomUUIDv7();

			const revision1: Revision = { ...VALID_REVISION, id: id1 };
			const revision2: Revision = { ...VALID_REVISION, id: id2 };

			await DrizzleRepositories.revisionDatabase.insert(revision1);
			await DrizzleRepositories.revisionDatabase.insert(revision2);

			const result1 = await DrizzleRepositories.revisionDatabase.findById(id1);
			const result2 = await DrizzleRepositories.revisionDatabase.findById(id2);

			expect(result1).toStrictEqual(revision1);
			expect(result2).toStrictEqual(revision2);
		});
	});

	describe("deleteById", () => {
		test("deleted revision is not found", async () => {
			await DrizzleRepositories.revisionDatabase.insert(VALID_REVISION);
			const resultBeforeDelete =
				await DrizzleRepositories.revisionDatabase.findById(VALID_REVISION.id);
			expect(resultBeforeDelete).toStrictEqual(VALID_REVISION);

			await DrizzleRepositories.revisionDatabase.deleteById(VALID_REVISION.id);
			const resultAfterDelete =
				await DrizzleRepositories.revisionDatabase.findById(VALID_REVISION.id);
			expect(resultAfterDelete).toBe(undefined);
		});

		test("do not throw when unknown id is specified", () => {
			expect(async () => {
				const id = Bun.randomUUIDv7();
				await DrizzleRepositories.revisionDatabase.deleteById(id);
			}).not.toThrow();
		});
	});
});

describe("eventDatabase", () => {
	beforeEach(async () => {
		await DB.delete(DrizzleTables.eventTable);
	});
	describe("attemptFirstN", () => {
		// TODO
	});
	describe("deleteById", () => {
		// TODO
	});
});
