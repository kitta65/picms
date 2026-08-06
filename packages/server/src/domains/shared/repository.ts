import type { Awaitable } from "picms-shared/types";

export interface ISharedStorage {
	issueSignedUrl: (id: string) => Awaitable<string>;
	checkAvailability: (id: string) => Awaitable<boolean>;
	deleteById: (id: string) => Awaitable<void>;
}

class FakeSharedStorage implements ISharedStorage {
	issueSignedUrl(_: string): Awaitable<string> {
		throw new Error("not implemented");
	}
	checkAvailability(_: string): Awaitable<boolean> {
		throw new Error("not implemented");
	}
	deleteById(_: string): Awaitable<void> {
		throw new Error("not implemented");
	}
}

export const _TEST = {
	FakeSharedStorage,
};
