import { describe, expect, spyOn, test } from "bun:test";
import type { Message } from "../../domains/message/entity";
import { _TEST as MESSAGE_REPOSITORY_TEST } from "../../domains/message/repository";
import type { Revision } from "../../domains/revision/entity";
import { _TEST as REVISION_REPOSITORY_TEST } from "../../domains/revision/repository";
import type { Work } from "../../domains/work/entity";
import { _TEST as WORK_REPOSITORY_TEST } from "../../domains/work/repository";
import { _TEST as MESSAGE_USECASE_TEST } from "./usecases";

const { FakeMessageDatabase } = MESSAGE_REPOSITORY_TEST;
const { FakeWorkDatabase } = WORK_REPOSITORY_TEST;
const { FakeRevisionDatabase } = REVISION_REPOSITORY_TEST;
const { handleRevisionInserted } = MESSAGE_USECASE_TEST;

const VALID_WORK: Work = {
	id: Bun.randomUUIDv7(),
	title: "foobar",
	description: "",
	public: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const VALID_REVISION: Revision = {
	id: Bun.randomUUIDv7(),
	workId: VALID_WORK.id,
	createdAt: new Date(),
};

const VALID_REVISION_INSERTED_MESSAGE: Message = {
	id: Bun.randomUUIDv7(),
	type: "REVISION_INSERTED",
	targetId: VALID_REVISION.id,
	attemptCount: 1,
	createdAt: new Date(),
	scheduledAt: new Date(),
};

describe("handleRevisionCreated", () => {
	test("delete message if everything was found", async () => {
		const revisionDatabase = new FakeRevisionDatabase();
		spyOn(revisionDatabase, "findById").mockImplementation(
			() => VALID_REVISION,
		);
		const workDatabase = new FakeWorkDatabase();
		spyOn(workDatabase, "findById").mockImplementation(() => VALID_WORK);
		const messageDatabase = new FakeMessageDatabase();
		const spy = spyOn(messageDatabase, "deleteById").mockImplementation(
			() => {},
		);

		const di = {
			messageDatabase,
			workDatabase,
			revisionDatabase,
		};

		await handleRevisionInserted(VALID_REVISION_INSERTED_MESSAGE, di);
		expect(spy).toBeCalledTimes(1);
	});

	test("delete message if revision was not found", async () => {
		const revisionDatabase = new FakeRevisionDatabase();
		spyOn(revisionDatabase, "findById").mockImplementation(() => undefined);
		const workDatabase = new FakeWorkDatabase();
		const messageDatabase = new FakeMessageDatabase();
		const spy = spyOn(messageDatabase, "deleteById").mockImplementation(
			() => {},
		);

		const di = {
			messageDatabase,
			workDatabase,
			revisionDatabase,
		};

		await handleRevisionInserted(VALID_REVISION_INSERTED_MESSAGE, di);
		expect(spy).toBeCalledTimes(1);
	});

	test("delete message and revision if work was not found", async () => {
		const revisionDatabase = new FakeRevisionDatabase();
		spyOn(revisionDatabase, "findById").mockImplementation(
			() => VALID_REVISION,
		);
		const revisionDeleteSpy = spyOn(
			revisionDatabase,
			"deleteById",
		).mockImplementation(() => {});
		const workDatabase = new FakeWorkDatabase();
		spyOn(workDatabase, "findById").mockImplementation(() => undefined);
		const messageDatabase = new FakeMessageDatabase();
		const messageDeleteSpy = spyOn(
			messageDatabase,
			"deleteById",
		).mockImplementation(() => {});

		const di = {
			messageDatabase,
			workDatabase,
			revisionDatabase,
		};

		await handleRevisionInserted(VALID_REVISION_INSERTED_MESSAGE, di);

		expect(revisionDeleteSpy).toBeCalledTimes(1);
		expect(messageDeleteSpy).toBeCalledTimes(1);
	});
});
