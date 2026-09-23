import type { Awaitable } from "picms-shared/types";

export type StreamWithSize = {
	stream: ReadableStream;
	size: number; // size in bytes
};

export interface ISharedStorage {
	issueSignedUrl: (id: string) => Awaitable<string>;
	checkAvailability: (id: string) => Awaitable<boolean>;
	readById: (id: string) => Awaitable<StreamWithSize>;
	deleteById: (id: string) => Awaitable<void>;
}

class FakeSharedStorage implements ISharedStorage {
	issueSignedUrl(_: string): ReturnType<ISharedStorage["issueSignedUrl"]> {
		throw new Error("not implemented");
	}
	checkAvailability(
		_: string,
	): ReturnType<ISharedStorage["checkAvailability"]> {
		throw new Error("not implemented");
	}
	readById(_: string): ReturnType<ISharedStorage["readById"]> {
		throw new Error("not implemented");
	}
	deleteById(_: string): ReturnType<ISharedStorage["deleteById"]> {
		throw new Error("not implemented");
	}
}

export const forTesting = {
	FakeSharedStorage,
};
