import type { Awaitable } from "picms-shared/types";
import type { Message } from "./entity";

type Options = {
	limit?: number;
	retryIntervalMinutes?: number;
	maxAttempts?: number;
};

export interface IMessageBroker {
	// insert() should be called from infrastructure layer
	insert: (message: Message) => Awaitable<Message>;
	attemptFirstN: (options?: Options) => Awaitable<Message[]>;
	deleteById: (id: Message["id"]) => Awaitable<void>;
}

class FakeMessageBroker implements IMessageBroker {
	insert(_: Message): Awaitable<Message> {
		throw new Error("not implemented");
	}

	attemptFirstN(_?: Options): Awaitable<Message[]> {
		throw new Error("not implemented");
	}

	deleteById(_: Message["id"]): Awaitable<void> {
		throw new Error("not implemented");
	}
}

export const _TEST = {
	FakeMessageBroker,
};
