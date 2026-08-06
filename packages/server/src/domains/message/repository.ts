import { HTTPException } from "hono/http-exception";
import type { Awaitable } from "picms-shared/types";
import { ERROR_CODE } from "../../constants";
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
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}

	pull(_?: Options): Awaitable<Message[]> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}

	ack(_: Message["id"]): Awaitable<void> {
		const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
		throw new HTTPException(status, { message });
	}
}

export const _TEST = {
	FakeMessageBroker,
};
