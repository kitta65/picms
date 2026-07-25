import type { Awaitable } from "picms-shared/types";
import type { Event, EventType } from "./entity";

export interface IEventDatabase {
	create: (
		type: EventType,
		targetId: number,
		schduledAt: Date | null,
	) => Awaitable<Event>;
	get: (limit?: number) => Awaitable<Event[]>;
	deleteById: (id: number) => Awaitable<Event | undefined>;
}
