import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import { _TEST as MESSAGE_REPOSITORY_TEST } from "../../domains/message/repository";
import type { Revision } from "../../domains/revision/entity";
import type { Work } from "../../domains/work/entity";
import { _TEST as DRIZZLE_REPOSITORY_TEST, workDatabase } from "./repositories";
import { revisionTable, workTable, workTagTable } from "./tables";
import { workView } from "./views";

const { DB, RevisionDatabase } = DRIZZLE_REPOSITORY_TEST;
const { FakeMessageBroker } = MESSAGE_REPOSITORY_TEST;

const VALID_WORK = {
	id: Bun.randomUUIDv7(),
	title: "foo",
	tags: [],
	description: "",
	public: true,
	createdAt: new Date(),
	updatedAt: new Date(),
} satisfies Work;

const VALID_REVISION_OLDEST = {
	id: Bun.randomUUIDv7(),
	workId: VALID_WORK.id,
	createdAt: new Date("2026-01-01"),
} satisfies Revision;

const VALID_REVISION_LATEST = {
	id: Bun.randomUUIDv7(),
	workId: VALID_WORK.id,
	createdAt: new Date("2026-01-02"),
} satisfies Revision;

describe("workView", () => {
	const messageBroker = new FakeMessageBroker();
	spyOn(messageBroker, "publish").mockImplementation((m) => m);
	const revisionDatabase = new RevisionDatabase({
		messageBroker,
	});

	beforeEach(async () => {
		await DB.delete(workTagTable);
		await DB.delete(workTable);
		await DB.delete(revisionTable);
	});

	describe("findMany", () => {
		test("returns latest revision id and all tags", async () => {
			const tags: string[] = ["foo", "bar"];
			const work = {
				...VALID_WORK,
				tags,
			} satisfies Work;
			await workDatabase.upsert(work);
			await revisionDatabase.insert(VALID_REVISION_LATEST);
			await revisionDatabase.insert(VALID_REVISION_OLDEST);
			const results = await workView.findMany();

			const result = results.at(0);
			if (!result || results.length !== 1) {
				expect.unreachable();
			}

			expect(result.revisionId).toBe(VALID_REVISION_LATEST.id);
			expect(result.tags.sort()).toEqual(tags.sort());
		});

		test("limit option is working", async () => {
			const work1 = {
				...VALID_WORK,
				id: Bun.randomUUIDv7(),
			} satisfies Work;
			const work2 = {
				...VALID_WORK,
				id: Bun.randomUUIDv7(),
			} satisfies Work;
			await workDatabase.upsert(work1);
			await workDatabase.upsert(work2);

			const resultsWitoutLimit = await workView.findMany();
			expect(resultsWitoutLimit.length).toBe(2);

			const resultsWithLimit = await workView.findMany({ limit: 1 });
			expect(resultsWithLimit.length).toBe(1);
		});

		test("orderBy options is working", async () => {
			const ts = Date.now();
			const work1 = {
				...VALID_WORK,
				id: Bun.randomUUIDv7(),
				createdAt: new Date(ts),
			} satisfies Work;
			const work2 = {
				...VALID_WORK,
				id: Bun.randomUUIDv7(),
				createdAt: new Date(ts + 1),
			} satisfies Work;

			// insert order does not matter if orderBy options is working
			await workDatabase.upsert(work2);
			await workDatabase.upsert(work1);

			const resultsAsc = await workView.findMany({
				orderBy: { createdAt: "asc" },
			});
			expect(resultsAsc.at(0)?.id).toBe(work1.id);

			const resultsDesc = await workView.findMany({
				orderBy: { createdAt: "desc" },
			});
			expect(resultsDesc.at(0)?.id).toBe(work2.id);
		});
	});
});
