import type { Message } from "./entity";

export type OperationResult<T> = {
	data: T;
	messages: Message[];
};
