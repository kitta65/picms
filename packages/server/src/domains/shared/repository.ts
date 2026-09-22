import type { Awaitable } from "picms-shared/types";
import { notImplemented } from "../../errors";

type StreamWithSize = {
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
	issueSignedUrl(_: string): Awaitable<string> {
		notImplemented();
	}
	checkAvailability(_: string): Awaitable<boolean> {
		notImplemented();
	}
	readById(_: string): Awaitable<StreamWithSize> {
		notImplemented();
	}
	deleteById(_: string): Awaitable<void> {
		notImplemented();
	}
}

export const _TEST = {
	FakeSharedStorage,
};
