import type { Awaitable } from "picms-shared/types";
import type { Event } from "./entity";

// insert method is not yet implemented
export interface IEventDatabase {
	attemptFirstN: (options?: {
		limit?: number;
		retryIntervalMinutes?: number;
		maxAttempts?: number;
	}) => Awaitable<Event[]>;
	deleteById: (id: Event["id"]) => Awaitable<Event | undefined>;
}
