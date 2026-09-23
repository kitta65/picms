import { Readable } from "node:stream";
import { type Bucket, Storage } from "@google-cloud/storage";
import type { Awaitable } from "picms-shared/types";
import type {
	ISharedStorage,
	StreamWithSize,
} from "../../domains/shared/repository";

export class RevisionStorage {
	bucket: Bucket;
	isFake: boolean;

	private constructor(bucket: Bucket, options: { isFake: boolean }) {
		this.bucket = bucket;
		this.isFake = options.isFake;
	}

	static async create(
		bucketName: string,
		options: { projectId: string; isFake: boolean },
	) {
		const storage = new Storage({
			apiEndpoint: "http://gcs:4443",
			projectId: "my-first-project",
		});
		const bucket = storage.bucket(bucketName);
		const [exists] = await bucket.exists();
		if (!exists && !options.isFake) {
			throw new Error("bucket does not exist");
		}
		if (!exists && options.isFake) {
			await bucket.create();
		}
		return new RevisionStorage(bucket, options);
	}

	// since save is executed via siged url, this method is just a utility for development
	async save(id: string, data: Blob) {
		const stream = data.stream();
		await this.bucket.file(id).save(stream);
	}

	async readById(id: string) {
		const readable = this.bucket.file(id).createReadStream();
		const stream = Readable.toWeb(readable);
		return stream;
	}
}

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
