import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import { _TEST as MESSAGE_REPOSITORY_TEST } from "../../../domains/message/repository";
import type { Revision } from "../../../domains/revision/entity";
import { DB } from "../configs";
import { revisionTable } from "../tables";
import { RevisionDatabase } from "./revision-database";

const { FakeMessageBroker } = MESSAGE_REPOSITORY_TEST;

const VALID_REVISION: Revision = {
	id: Bun.randomUUIDv7(),
	workId: Bun.randomUUIDv7(),
	createdAt: new Date(),
};

const messageBroker = new FakeMessageBroker();
spyOn(messageBroker, "publish").mockImplementation((m) => m);

const revisionDatabase = new RevisionDatabase({
	messageBroker,
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
		const { messages: results } = await revisionDatabase.insert(VALID_REVISION);
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
		// biome-ignore lint: intentional type error for test
		const id = null as any;
		const revision: Revision = {
			...VALID_REVISION,
			id,
		};
		await expect(revisionDatabase.insert(revision)).rejects.toThrow();
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

describe("findByWorkId", () => {
	test("returns all matched revisions", async () => {
		const revision1 = { ...VALID_REVISION, id: Bun.randomUUIDv7() };
		const revision2 = { ...VALID_REVISION, id: Bun.randomUUIDv7() };
		await revisionDatabase.insert(revision1);
		await revisionDatabase.insert(revision2);
		const revisions = await revisionDatabase.findByWorkId(revision1.workId);
		expect(revisions.length).toBe(2);
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

	test("does not throw when unknown id is specified", async () => {
		try {
			const id = Bun.randomUUIDv7();
			await revisionDatabase.deleteById(id);
		} catch {
			expect.unreachable();
		}
	});
});
