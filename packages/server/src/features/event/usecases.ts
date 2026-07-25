import type { Event } from "../../domain/event/entity";
import type { IEventDatabase } from "../../domain/event/repository";
import type { IWorkRevisionDatabase } from "../../domain/work-revision/repository";

export async function handleAll(
	eventDatabase: IEventDatabase,
	revisionDatabase: IWorkRevisionDatabase,
) {
	const events = await eventDatabase.get();
	for (const e of events) {
		const type_ = e.type;
		switch (type_) {
			case "REVISION_SIGNED_URL_EXPIRED":
				await handleRevisionSignedUrlExpired(e, revisionDatabase);
				break;
			case "WORK_DELETED":
				console.warn("TODO: not implemented");
				break;
			default: {
				const unreachable: never = type_;
				throw new Error(`unreachable: ${unreachable}`);
			}
		}
	}
}

async function handleRevisionSignedUrlExpired(
	e: Event,
	db: IWorkRevisionDatabase,
) {
	const id = e.targetId;
	const results = await db.deleteById(id);
	if (!results) {
		console.info(
			`the revision (id: ${id}) has not been deleted (maybe it does not exist)`,
		);
	}
}
