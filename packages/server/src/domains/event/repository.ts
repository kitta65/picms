import type { Awaitable } from "picms-shared/types";
import type { Event } from "./entity";

type Options = {
	limit?: number;
	retryIntervalMinutes?: number;
	maxAttempts?: number;
};

export interface IEventDatabase {
	// insert() should be called from infrastructure layer
	insert: (event: Event) => Awaitable<Event>;
	attemptFirstN: (options?: Options) => Awaitable<Event[]>;
	deleteById: (id: Event["id"]) => Awaitable<void>;
}

class FakeEventDatabase implements IEventDatabase {
	insert(_: Event): Awaitable<Event> {
		throw new Error("not implemented");
	}

	attemptFirstN(_?: Options): Awaitable<Event[]> {
		throw new Error("not implemented");
	}

	deleteById(_: Event["id"]): Awaitable<void> {
		throw new Error("not implemented");
	}
}

export const _TEST = {
	FakeEventDatabase,
};
