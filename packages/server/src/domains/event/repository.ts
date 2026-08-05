import type { Awaitable } from "picms-shared/types";
import type { Event } from "./entity";

type Options = {
	limit?: number;
	retryIntervalMinutes?: number;
	maxAttempts?: number;
};

// insert method is not yet implemented
export interface IEventDatabase {
	insert: (event: Event) => Awaitable<Event>;
	attemptFirstN: (options?: Options) => Awaitable<Event[]>;
	deleteById: (id: Event["id"]) => Awaitable<void>;
}

class EventDatabaseForTest implements IEventDatabase {
	methods: Partial<IEventDatabase>;

	constructor(methods: Partial<IEventDatabase>) {
		this.methods = methods;
	}

	async insert(event: Event) {
		const fn = this.methods.insert;
		if (!fn) {
			throw new Error("not implemented");
		}
		return await fn(event);
	}

	async attemptFirstN(options?: Options) {
		const fn = this.methods.attemptFirstN;
		if (!fn) {
			throw new Error("not implemented");
		}
		return await fn(options);
	}

	async deleteById(id: Event["id"]) {
		const fn = this.methods.deleteById;
		if (!fn) {
			throw new Error("not implemented");
		}
		await fn(id);
	}
}

export const _TEST = {
	EventDatabaseForTest,
};
