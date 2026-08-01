import type { Awaitable } from "picms-shared/types";
import type { Event } from "./entity";

export interface IEventDatabase {
	insert: (event: Event) => Awaitable<Event>;
	findMany: (options?: { limit?: number }) => Awaitable<Event[]>;
	deleteById: (id: Event["id"]) => Awaitable<Event | undefined>;
}
