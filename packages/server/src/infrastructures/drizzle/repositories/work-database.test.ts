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

			await workDatabase.insert(work1);
			await workDatabase.insert(work2);

			const result1 = await workDatabase.findById(id1);
			const result2 = await workDatabase.findById(id2);

			expect(result1).toStrictEqual(work1);
			expect(result2).toStrictEqual(work2);
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
			const modifiedWork: Work = {
				...VALID_WORK,
				tags: [...VALID_WORK.tags, "one more tag"],
			};
			await expect(workDatabase.insert(modifiedWork)).rejects.toThrow();
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
});
