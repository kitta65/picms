import type { Awaitable } from "picms-shared/types";

export interface ISharedStorage {
	issueSignedUrl: (id: string) => Awaitable<string>;
	checkAvailability: (id: string) => Awaitable<boolean>;
	deleteById: (id: string) => Awaitable<void>;
}
