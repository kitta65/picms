import * as z from "zod";

import { ORPHAN_REVISION_TTL_MINUTES } from "../../constants";

export const REVISION_SCHEMA = z.object({
	id: z.uuidv7(),
	workId: z.uuidv7(),
	createdAt: z.date(),
});

export type Revision = z.infer<typeof REVISION_SCHEMA>;

export const Revision = {
	isWithinOrphanTtl(revision: Revision, now?: Date) {
		const currUnixMs = Number(now) ?? Date.now();
		const elapsedMilliSeconds = currUnixMs - Number(revision.createdAt);
		const elapsedMinutes = elapsedMilliSeconds / 1000 / 60;
		const result = ORPHAN_REVISION_TTL_MINUTES < elapsedMinutes;
		return result;
	},
};
