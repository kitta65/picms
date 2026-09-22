import { eq } from "drizzle-orm";
import {
	ORPHAN_REVISION_TTL_MINUTES,
	SIGNED_URL_TTL_MINUTES,
} from "../../../constants";
import { MESSAGE_SCHEMA, Message } from "../../../domains/message/entity";
import type { IMessageBroker } from "../../../domains/message/repository";
import {
	REVISION_SCHEMA,
	type Revision,
} from "../../../domains/revision/entity";
import type { IRevisionDatabase } from "../../../domains/revision/repository";
import { DB } from "../configs";
import { messageTable, revisionTable } from "../tables";

export class RevisionDatabase implements IRevisionDatabase {
	messageBroker?: IMessageBroker;

	constructor(di?: { messageBroker: IMessageBroker }) {
		this.messageBroker = di?.messageBroker;
	}

	async insert(revision: Revision) {
		const result = await DB.transaction(async (tx) => {
			// insert
			const results = await tx
				.insert(revisionTable)
				.values(revision)
				.returning();
			const insertedRevision = results.at(0);
			if (!insertedRevision) {
				throw new Error("something went wrong");
			}

			// publish messages
			const scheduledAt = new Date();
			scheduledAt.setMinutes(
				scheduledAt.getMinutes() +
					ORPHAN_REVISION_TTL_MINUTES +
					SIGNED_URL_TTL_MINUTES +
					5, // margin
			);
			const revisionInsertedMessage = Message.create({
				type: "REVISION_INSERTED",
				targetId: insertedRevision.id,
			});
			const revisionSignedUrlExpiredMessage = Message.create({
				type: "REVISION_SIGNED_URL_EXPIRED",
				targetId: insertedRevision.id,
				scheduledAt,
			});

			let insertedMessages: unknown[] = [];
			if (this.messageBroker) {
				insertedMessages = await Promise.all([
					this.messageBroker.publish(revisionInsertedMessage),
					this.messageBroker.publish(revisionSignedUrlExpiredMessage),
				]);
			} else {
				insertedMessages = await tx
					.insert(messageTable)
					.values([revisionInsertedMessage, revisionSignedUrlExpiredMessage])
					.returning();
			}

			return { insertedRevision, insertedMessages };
		});

		const operationResult = {
			data: REVISION_SCHEMA.parse(result.insertedRevision),
			messages: result.insertedMessages.map((m) => MESSAGE_SCHEMA.parse(m)),
		};
		return operationResult;
	}

	async findById(id: Revision["id"]) {
		const revisions = await DB.select()
			.from(revisionTable)
			.where(eq(revisionTable.id, id));

		const revision = revisions.at(0);

		if (!revision) {
			return undefined;
		}

		const entity = REVISION_SCHEMA.parse(revision);
		return entity;
	}

	async findByWorkId(workId: Parameters<IRevisionDatabase["findByWorkId"]>[0]) {
		const revisions = await DB.select()
			.from(revisionTable)
			.where(eq(revisionTable.workId, workId));
		return revisions;
	}

	async deleteById(id: Revision["id"]) {
		await DB.delete(revisionTable).where(eq(revisionTable.id, id));
	}
}

export const revisionDatabase = new RevisionDatabase();
