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
		const currDate = now ?? new Date();
		const currUnixMs = Number(currDate);
		const elapsedMilliSeconds = currUnixMs - Number(revision.createdAt);
		const elapsedMinutes = elapsedMilliSeconds / 1000 / 60;
		const result = elapsedMinutes <= ORPHAN_REVISION_TTL_MINUTES;
		return result;
	},
};
