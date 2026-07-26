import * as z from "zod";

const EVENT_TYPES = [
	"REVISION_CREATED",
	"REVISION_SIGNED_URL_EXPIRED",
	"WORK_DELETED",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_SCHEMA = z.object({
	id: z.uuidv7(),
	type: z.enum(EVENT_TYPES),
	targetId: z.uuidv7(),
	scheduledAt: z.date(),
	createdAt: z.date(),
});
export type Event = z.infer<typeof EVENT_SCHEMA>;
