export interface ISharedStorage {
	getSignedUrl: (filename: string) => Promise<string>;
	checkAvailability: (filename: string) => Promise<boolean>;
}
