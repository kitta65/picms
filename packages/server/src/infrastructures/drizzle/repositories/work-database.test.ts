import { beforeEach, describe, expect, test } from "bun:test";
import type { Work } from "../../../domains/work/entity";
import { DB } from "../configs";
import { workTable, workTagTable } from "../tables";
import { workDatabase } from "./work-database";

const VALID_WORK: Work = {
	id: Bun.randomUUIDv7(),
	tags: ["foo", "bar"],
	description: "this is description",
	title: "this is title",
	public: true,
	createdAt: new Date(),
	updatedAt: new Date(),
} as const;

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

		await workDatabase.insert(work1);
		await workDatabase.insert(work2);

		const result1 = await workDatabase.findById(id1);
		const result2 = await workDatabase.findById(id2);

		expect(result1).toStrictEqual(work1);
		expect(result2).toStrictEqual(work2);
	});

	test("the order of tags are predictable", async () => {
		let work = {
			...VALID_WORK,
			tags: ["foo", "bar"],
		};
		let result = await workDatabase.insert(work);
		// should be the order of original array (work.tags)
		expect(result.tags).toStrictEqual(["foo", "bar"]);

		work = {
			...work,
			tags: ["bar"],
		};
		result = await workDatabase.update(work);
		work = {
			...work,
			tags: ["foo", "bar"],
		};
		result = await workDatabase.update(work);
		// since bar is the most long-lived tag, it comes first
		expect(result.tags).toStrictEqual(["bar", "foo"]);
	});
});

describe("insert", () => {
	test("returns inserted value", async () => {
		const result = await workDatabase.insert(VALID_WORK);
		expect(result).toStrictEqual(VALID_WORK);
	});

	test("returns inserted value (empty tags)", async () => {
		const work = { ...VALID_WORK, tags: [] };
		const result = await workDatabase.insert(work);
		expect(result).toStrictEqual(work);
	});

	test("throws when the same id already exists", async () => {
		await workDatabase.insert(VALID_WORK);
		await expect(workDatabase.insert(VALID_WORK)).rejects.toThrow();
	});

	test("tags are deduped", async () => {
		const work: Work = {
			...VALID_WORK,
			tags: ["foo", "foo"],
		};
		const result = await workDatabase.insert(work);
		await expect(result.tags).toStrictEqual(["foo"]);
	});

	test("not null constraints are working", async () => {
		// biome-ignore lint: intentional type error for test
		const id = null as any;
		const work: Work = {
			...VALID_WORK,
			id,
		};
		await expect(workDatabase.insert(work)).rejects.toThrow();
	});
});

describe("update", () => {
	test("retuns all properties when updated", async () => {
		const inserted = await workDatabase.insert(VALID_WORK);
		const updated = await workDatabase.update({
			id: inserted.id,
			updatedAt: inserted.updatedAt,
		});
		expect(updated).toStrictEqual(inserted);
	});

	test("the tag which is not specified when update is removed", async () => {
		const work: Work = {
			...VALID_WORK,
			tags: ["foo", "bar"],
		};
		const inserted = await workDatabase.insert(work);
		const updated = await workDatabase.update({
			id: inserted.id,
			tags: ["foo"],
			updatedAt: new Date(),
		});
		await expect(updated.tags).toStrictEqual(["foo"]);
	});

	test("tags are deduped", async () => {
		const work: Work = {
			...VALID_WORK,
			tags: ["foo"],
		};
		const inserted = await workDatabase.insert(work);
		const updated = await workDatabase.update({
			id: inserted.id,
			tags: ["foo", "foo", "bar", "bar"],
			updatedAt: new Date(),
		});
		await expect(updated.tags).toStrictEqual(["foo", "bar"]);
	});
});

describe("deleteById", () => {
	test("deleted work is not found any more", async () => {
		const inserted = await workDatabase.insert(VALID_WORK);
		const resultAfterInsert = await workDatabase.findById(inserted.id);
		expect(resultAfterInsert).toBeDefined();

		await workDatabase.deleteById(inserted.id);
		const resultAfterDelete = await workDatabase.findById(inserted.id);
		expect(resultAfterDelete).toBeUndefined();
	});
});
