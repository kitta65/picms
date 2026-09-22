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
	publish(_: Message): ReturnType<IMessageBroker["publish"]> {
		throw new Error("not implemented");
	}

	pull(_?: Options): ReturnType<IMessageBroker["pull"]> {
		throw new Error("not implemented");
	}

	ack(_: Message["id"]): ReturnType<IMessageBroker["ack"]> {
		throw new Error("not implemented");
	}
}

export const forTesting = {
	FakeMessageBroker,
};
