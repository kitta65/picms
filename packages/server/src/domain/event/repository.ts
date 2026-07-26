import type { Awaitable } from "picms-shared/types";
import type { Event } from "./entity";

export interface IEventDatabase {
	create: (event: Event) => Awaitable<Event>;
	get: (options?: { limit?: number }) => Awaitable<Event[]>;
	deleteById: (id: Event["id"]) => Awaitable<Event | undefined>;
}
