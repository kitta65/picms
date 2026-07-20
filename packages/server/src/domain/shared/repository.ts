export interface ISharedStorage {
	getSignedUrl: (filename: string) => Promise<string>;
}
