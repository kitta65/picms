import type { Event } from "../../domain/event/entity";
import type { IEventDatabase } from "../../domain/event/repository";
import type { IRevisionDatabase } from "../../domain/revision/repository";
import type { IWorkDatabase } from "../../domain/work/repository";

export async function handleAll(
	eventDatabase: IEventDatabase,
	workDatabase: IWorkDatabase,
	revisionDatabase: IRevisionDatabase,
) {
	const events = await eventDatabase.get();
	for (const e of events) {
		switch (e.type) {
			case "REVISION_CREATED":
				await handleRevisionCreated(e, workDatabase, revisionDatabase);
				break;
			case "REVISION_SIGNED_URL_EXPIRED":
				await handleRevisionSignedUrlExpired(e, revisionDatabase);
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
	e: Event,
	workDatabase: IWorkDatabase,
	revisionDatabase: IRevisionDatabase,
) {
	const revision = await revisionDatabase.getById(e.targetId);
	if (!revision) {
		return;
	}

	// since work and revision belong to different repository, work might have been deleted **before** the creation of the revision.
	// in that case, the orphan revision should be deleted here.
	const work = workDatabase.getById({ id: revision.workId });
	if (!work) {
		await revisionDatabase.deleteById(revision.id);
	}
	// TODO: mark event as completed
}

async function handleRevisionSignedUrlExpired(e: Event, db: IRevisionDatabase) {
	const results = await db.deleteById(e.targetId);
	if (!results) {
		console.info(
			`the revision (id: ${e.id}) has not been deleted (maybe it does not exist)`,
		);
	}
	// TODO: mark event as completed
}
