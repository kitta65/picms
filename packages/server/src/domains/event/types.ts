import type { Event } from "./entity";

export type OperationResult<T> = {
	data: T;
	events: Event[];
};
