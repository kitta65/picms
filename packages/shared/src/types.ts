export type Awaitable<T> = T | Promise<T>;

export type AtLeast<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
