import { describe, expect, test } from "bun:test";
import { RevisionStorage } from "./repositories";

describe("revisionStorage", () => {
	describe("readById", () => {
		test("can read saved data", async () => {
			const bucketName = Bun.randomUUIDv7();
			const projectId = Bun.randomUUIDv7();
			const storage = await RevisionStorage.create(bucketName, {
				projectId,
				isFake: true,
			});

			// save
			const fileName = Bun.randomUUIDv7();
			const buffer = new ArrayBuffer(4);
			await storage.save(fileName, new Blob([buffer]));

			// read
			const stream = await storage.readById(fileName);
			const u8s = await stream.bytes();

			// assertion
			for (const u8 of u8s) {
				expect(u8).toBe(0);
			}
		});
	});
});
