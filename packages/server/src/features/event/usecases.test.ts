import { describe, expect, spyOn, test } from "bun:test";
import type { Event } from "../../domains/event/entity";
import { _TEST as EVENT_REPOSITORY_TEST } from "../../domains/event/repository";
import type { Revision } from "../../domains/revision/entity";
import { _TEST as REVISION_REPOSITORY_TEST } from "../../domains/revision/repository";
import type { Work } from "../../domains/work/entity";
import { _TEST as WORK_REPOSITORY_TEST } from "../../domains/work/repository";
import { _TEST as EVENT_USECASE_TEST } from "./usecases";

const { FakeEventDatabase } = EVENT_REPOSITORY_TEST;
const { FakeWorkDatabase } = WORK_REPOSITORY_TEST;
const { FakeRevisionDatabase } = REVISION_REPOSITORY_TEST;
const { handleRevisionInserted } = EVENT_USECASE_TEST;

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

const VALID_REVISION_INSERTED_EVENT: Event = {
	id: Bun.randomUUIDv7(),
	type: "REVISION_INSERTED",
	targetId: VALID_REVISION.id,
	attemptCount: 1,
	createdAt: new Date(),
	scheduledAt: new Date(),
};

describe("handleRevisionCreated", () => {
	test("delete event if everything was found", async () => {
		const revisionDatabase = new FakeRevisionDatabase();
		spyOn(revisionDatabase, "findById").mockImplementation(
			() => VALID_REVISION,
		);
		const workDatabase = new FakeWorkDatabase();
		spyOn(workDatabase, "findById").mockImplementation(() => VALID_WORK);
		const eventDatabase = new FakeEventDatabase();
		const spy = spyOn(eventDatabase, "deleteById").mockImplementation(() => {});

		const di = {
			eventDatabase,
			workDatabase,
			revisionDatabase,
		};

		await handleRevisionInserted(VALID_REVISION_INSERTED_EVENT, di);
		expect(spy).toBeCalledTimes(1);
	});

	test("delete event if revision was not found", async () => {
		const revisionDatabase = new FakeRevisionDatabase();
		spyOn(revisionDatabase, "findById").mockImplementation(() => undefined);
		const workDatabase = new FakeWorkDatabase();
		const eventDatabase = new FakeEventDatabase();
		const spy = spyOn(eventDatabase, "deleteById").mockImplementation(() => {});

		const di = {
			eventDatabase,
			workDatabase,
			revisionDatabase,
		};

		await handleRevisionInserted(VALID_REVISION_INSERTED_EVENT, di);
		expect(spy).toBeCalledTimes(1);
	});

	test("delete event and revision if work was not found", async () => {
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
		const eventDatabase = new FakeEventDatabase();
		const eventDeleteSpy = spyOn(
			eventDatabase,
			"deleteById",
		).mockImplementation(() => {});

		const di = {
			eventDatabase,
			workDatabase,
			revisionDatabase,
		};

		await handleRevisionInserted(VALID_REVISION_INSERTED_EVENT, di);

		expect(revisionDeleteSpy).toBeCalledTimes(1);
		expect(eventDeleteSpy).toBeCalledTimes(1);
	});
});
