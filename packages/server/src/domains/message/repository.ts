import type { Awaitable } from "picms-shared/types";
import { notImplemented } from "../../errors";
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
		notImplemented();
	}

	pull(_?: Options): Awaitable<Message[]> {
		notImplemented();
	}

	ack(_: Message["id"]): Awaitable<void> {
		notImplemented();
	}
}

export const _TEST = {
	FakeMessageBroker,
};
