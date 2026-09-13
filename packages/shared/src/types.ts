export type Awaitable<T> = T | Promise<T>;

export type AtLeast<T, U extends keyof T> = Partial<T> & Pick<T, U>;

export function assertNever(_: never): never {
	throw new Error("can't be!");
}
