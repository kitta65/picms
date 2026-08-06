import type { Message } from "../../domains/message/entity";
import type { IMessageBroker } from "../../domains/message/repository";
import type { IRevisionDatabase } from "../../domains/revision/repository";
import type { ISharedStorage } from "../../domains/shared/repository";
import type { IWorkDatabase } from "../../domains/work/repository";
import { assertNever } from "../../utils";

const RETRY_INTERVAL_MINUTES = 1;
const MAX_ATTEMPTS = 3;

export async function handleFirstN(
	n: number,
	di: {
		messageBroker: IMessageBroker;
		workDatabase: IWorkDatabase;
		revisionDatabase: IRevisionDatabase;
		revisionStorage: ISharedStorage;
	},
) {
	const messages = await di.messageBroker.pull({
		limit: n,
		retryIntervalMinutes: RETRY_INTERVAL_MINUTES,
		maxAttempts: MAX_ATTEMPTS,
	});
	for (const m of messages) {
		switch (m.type) {
			case "REVISION_INSERTED":
				await handleRevisionInserted(m, di);
				break;
			case "REVISION_SIGNED_URL_EXPIRED":
				await handleRevisionSignedUrlExpired(m, di);
				break;
			case "WORK_DELETED":
				console.warn("TODO: not implemented");
				break;
			default: {
				assertNever(m.type);
			}
		}
	}
}

async function handleRevisionInserted(
	message: Message,
	di: {
		messageBroker: IMessageBroker;
		workDatabase: IWorkDatabase;
		revisionDatabase: IRevisionDatabase;
	},
) {
	const revision = await di.revisionDatabase.findById(message.targetId);
	if (!revision) {
		await di.messageBroker.ack(message.id);
		return;
	}

	// since work and revision belong to different repository, work might have been deleted **before** the creation of the revision.
	// in that case, the orphan revision should be deleted here.
	const work = await di.workDatabase.findById(revision.workId);
	if (!work) {
		await di.revisionDatabase.deleteById(revision.id);
	}

	await di.messageBroker.ack(message.id);
}

async function handleRevisionSignedUrlExpired(
	message: Message,
	di: {
		messageBroker: IMessageBroker;
		revisionDatabase: IRevisionDatabase;
		revisionStorage: ISharedStorage;
	},
) {
	await di.revisionDatabase.deleteById(message.targetId);
	await di.revisionStorage.deleteById(message.id);
	await di.messageBroker.ack(message.id);
}

export const _TEST = {
	handleRevisionInserted,
};
