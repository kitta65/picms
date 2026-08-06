import type { Awaitable } from "picms-shared/types";
import type { Message } from "./entity";

type Options = {
	limit?: number;
	retryIntervalMinutes?: number;
	maxAttempts?: number;
};

export interface IMessageBroker {
	// publish() should be called from infrastructure layer
	publish: (message: Message) => Awaitable<Message>;
	pull: (options?: Options) => Awaitable<Message[]>;
	ack: (id: Message["id"]) => Awaitable<void>;
}

class FakeMessageBroker implements IMessageBroker {
	publish(_: Message): Awaitable<Message> {
		throw new Error("not implemented");
	}

	pull(_?: Options): Awaitable<Message[]> {
		throw new Error("not implemented");
	}

	ack(_: Message["id"]): Awaitable<void> {
		throw new Error("not implemented");
	}
}

export const _TEST = {
	FakeMessageBroker,
};
