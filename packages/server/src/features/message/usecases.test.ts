import { describe, expect, spyOn, test } from "bun:test";
import type { Message } from "../../domains/message/entity";
import { forTesting as messageRepositoryForTesting } from "../../domains/message/repository";
import type { Revision } from "../../domains/revision/entity";
import { forTesting as revisionRepositoryForTesting } from "../../domains/revision/repository";
import type { Work } from "../../domains/work/entity";
import { forTesting as workRepositoryForTesting } from "../../domains/work/repository";
import { forTesting as messageUsecaseForTesting } from "./usecases";

const { FakeMessageBroker } = messageRepositoryForTesting;
const { FakeWorkDatabase } = workRepositoryForTesting;
const { FakeRevisionDatabase } = revisionRepositoryForTesting;
const { handleRevisionInserted } = messageUsecaseForTesting;

const VALID_WORK: Work = {
	id: Bun.randomUUIDv7(),
	tags: ["foo", "bar"],
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

export const VALID_WORK_DELETED_MESSAGE: Message = {
	id: Bun.randomUUIDv7(),
	type: "WORK_DELETED",
	targetId: VALID_WORK.id,
	attemptCount: 1,
	createdAt: new Date(),
	scheduledAt: new Date(),
};

describe("handleRevisionInserted", () => {
	test("ack message if everything was found", async () => {
		const revisionDatabase = new FakeRevisionDatabase();
		spyOn(revisionDatabase, "findById").mockImplementation(
			() => VALID_REVISION,
		);
		const workDatabase = new FakeWorkDatabase();
		spyOn(workDatabase, "findById").mockImplementation(() => VALID_WORK);
		const messageBroker = new FakeMessageBroker();
		const spy = spyOn(messageBroker, "ack").mockImplementation(() => {});

		const di = {
			messageBroker,
			workDatabase,
			revisionDatabase,
		};

		await handleRevisionInserted(VALID_REVISION_INSERTED_MESSAGE, di);
		expect(spy).toBeCalledTimes(1);
	});

	test("ack message if revision was not found", async () => {
		const revisionDatabase = new FakeRevisionDatabase();
		spyOn(revisionDatabase, "findById").mockImplementation(() => undefined);
		const workDatabase = new FakeWorkDatabase();
		const messageBroker = new FakeMessageBroker();
		const spy = spyOn(messageBroker, "ack").mockImplementation(() => {});

		const di = {
			messageBroker,
			workDatabase,
			revisionDatabase,
		};

		await handleRevisionInserted(VALID_REVISION_INSERTED_MESSAGE, di);
		expect(spy).toBeCalledTimes(1);
	});

	test("ack message and delete revision if work was not found", async () => {
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
		const messageBroker = new FakeMessageBroker();
		const messageAckSpy = spyOn(messageBroker, "ack").mockImplementation(
			() => {},
		);

		const di = {
			messageBroker,
			workDatabase,
			revisionDatabase,
		};

		await handleRevisionInserted(VALID_REVISION_INSERTED_MESSAGE, di);

		expect(revisionDeleteSpy).toBeCalledTimes(1);
		expect(messageAckSpy).toBeCalledTimes(1);
	});
});
