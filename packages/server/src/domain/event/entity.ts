import * as z from "zod";

const EVENT_TYPES = ["REVISION_SIGNED_URL_EXPIRED", "WORK_DELETED"] as const;
const EVENT_TYPE_SCHEMA = z.enum(EVENT_TYPES);
export type EventType = (typeof EVENT_TYPES)[number];

export class Event {
	id: number;
	type: EventType;
	targetId: number;
	scheduledAt: Date | null;
	createdAt: Date;

	constructor({
		id,
		type,
		targetId,
		scheduledAt,
		createdAt,
	}: {
		id: number;
		type: string;
		targetId: number;
		scheduledAt: Date | null;
		createdAt: Date;
	}) {
		this.id = id;
		this.type = EVENT_TYPE_SCHEMA.parse(type);
		this.targetId = targetId;
		this.scheduledAt = scheduledAt;
		this.createdAt = createdAt;
	}
}
