import * as z from "zod";

const EVENT_TYPES = [
	"REVISION_INSERTED",
	"REVISION_SIGNED_URL_EXPIRED",
	"WORK_DELETED",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_SCHEMA = z.object({
	id: z.uuidv7(),
	type: z.enum(EVENT_TYPES),
	targetId: z.uuidv7(),
	attemptCount: z.int(),
	scheduledAt: z.date(),
	createdAt: z.date(),
});

export type Event = z.infer<typeof EVENT_SCHEMA>;
export const Event = {
	create(input: {
		type: Event["type"];
		targetId: Event["targetId"];
		scheduledAt?: Event["scheduledAt"];
	}) {
		const ts = new Date();
		const event: Event = {
			id: Bun.randomUUIDv7(),
			type: input.type,
			targetId: input.targetId,
			attemptCount: 0,
			scheduledAt: input.scheduledAt ?? ts,
			createdAt: ts,
		};
		return event;
	},
};
