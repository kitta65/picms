import type { Event } from "../../domains/event/entity";
import type { IEventDatabase } from "../../domains/event/repository";
import type { IRevisionDatabase } from "../../domains/revision/repository";
import type { ISharedStorage } from "../../domains/shared/repository";
import type { IWorkDatabase } from "../../domains/work/repository";

const RETRY_INTERVAL_MINUTES = 1;
const MAX_ATTEMPTS = 3;

export async function handleFirstN(
	n: number,
	di: {
		eventDatabase: IEventDatabase;
		workDatabase: IWorkDatabase;
		revisionDatabase: IRevisionDatabase;
		revisionStorage: ISharedStorage;
	},
) {
	const events = await di.eventDatabase.attemptFirstN({
		limit: n,
		retryIntervalMinutes: RETRY_INTERVAL_MINUTES,
		maxAttempts: MAX_ATTEMPTS,
	});
	for (const e of events) {
		switch (e.type) {
			case "REVISION_INSERTED":
				await handleRevisionCreated(e, di);
				break;
			case "REVISION_SIGNED_URL_EXPIRED":
				await handleRevisionSignedUrlExpired(e, di);
				break;
			case "WORK_DELETED":
				console.warn("TODO: not implemented");
				break;
			default: {
				const unreachable: never = e.type;
				throw new Error(`unreachable: ${unreachable}`);
			}
		}
	}
}

async function handleRevisionCreated(
	event: Event,
	di: {
		eventDatabase: IEventDatabase;
		workDatabase: IWorkDatabase;
		revisionDatabase: IRevisionDatabase;
	},
) {
	const revision = await di.revisionDatabase.findById(event.targetId);
	if (!revision) {
		return;
	}

	// since work and revision belong to different repository, work might have been deleted **before** the creation of the revision.
	// in that case, the orphan revision should be deleted here.
	const work = await di.workDatabase.findById(revision.workId);
	if (!work) {
		await di.revisionDatabase.deleteById(revision.id);
	}

	await di.eventDatabase.deleteById(event.id);
}

async function handleRevisionSignedUrlExpired(
	event: Event,
	di: {
		eventDatabase: IEventDatabase;
		revisionDatabase: IRevisionDatabase;
		revisionStorage: ISharedStorage;
	},
) {
	await di.revisionDatabase.deleteById(event.targetId);
	await di.revisionStorage.deleteByFileName(event.id);
	await di.eventDatabase.deleteById(event.id);
}
