import type { Awaitable } from "picms-shared/types";
import type {
	ISharedStorage,
	StreamWithSize,
} from "../../domains/shared/repository";

export const revisionStorage: ISharedStorage = {
	issueSignedUrl(_: string): Awaitable<string> {
		throw new Error("not implemented");
	},
	checkAvailability(_: string): Awaitable<boolean> {
		throw new Error("not implemented");
	},
	readById(_: string): Awaitable<StreamWithSize> {
		throw new Error("not implemented");
	},
	deleteById(_: string): Awaitable<void> {
		throw new Error("not implemented");
	},
};
