import * as z from "zod";

const MESSAGE_TYPES = [
	"REVISION_INSERTED",
	"REVISION_SIGNED_URL_EXPIRED",
	"WORK_DELETED",
] as const;

export const MESSAGE_SCHEMA = z.object({
	id: z.uuidv7(),
	type: z.enum(MESSAGE_TYPES),
	targetId: z.uuidv7(),
	attemptCount: z.int(),
	scheduledAt: z.date(),
	createdAt: z.date(),
});

export type Message = z.infer<typeof MESSAGE_SCHEMA>;
export const Message = {
	create(input: {
		type: Message["type"];
		targetId: Message["targetId"];
		scheduledAt?: Message["scheduledAt"];
	}) {
		const ts = new Date();
		const message: Message = {
			id: Bun.randomUUIDv7(),
			type: input.type,
			targetId: input.targetId,
			attemptCount: 0,
			scheduledAt: input.scheduledAt ?? ts,
			createdAt: ts,
		};
		return message;
	},
};
