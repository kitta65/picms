import type { Awaitable } from "picms-shared/types";

export interface ISharedStorage {
	getSignedUrl: (id: string) => Awaitable<string>;
	checkAvailability: (id: string) => Awaitable<boolean>;
	deleteByFileName: (id: string) => Awaitable<void>;
}
