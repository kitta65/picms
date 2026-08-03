import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import * as LocalRepository from "../../infrastructures/local/repositories";
import type { Revision } from "./entity";
import * as RevisionService from "./service";

const TEMP_DIR_NAME = "revision-service-test";

class TestStorage extends LocalRepository._TEST.SharedStorage {
	directory = TEMP_DIR_NAME;
	constructor() {
		super("dummy/api/base/url", { skipValidation: true });
	}
}

const DI = {
	revisionStorage: new TestStorage(),
};

async function cleanUp() {
	const path_ = path.resolve(LocalRepository._TEST.BASE_PATH, TEMP_DIR_NAME);
	await fs.rm(path_, { recursive: true, force: true });
}

beforeAll(async () => {
	await cleanUp();
});

afterAll(async () => {
	await cleanUp();
});

describe("checkStorageAvailability", () => {
	test("true when new uuid is specified", async () => {
		const revision: Revision = {
			id: Bun.randomUUIDv7(),
			workId: Bun.randomUUIDv7(),
			createdAt: new Date(),
		};
		const result = await RevisionService.checkStorageAvailability(revision, DI);
		expect(result).toBe(true);
	});

	test("false after other data is written", async () => {
		const revision: Revision = {
			id: Bun.randomUUIDv7(),
			workId: Bun.randomUUIDv7(),
			createdAt: new Date(),
		};
		await DI.revisionStorage.save(
			revision.id,
			"dummy token",
			new Blob(["dummy blob data"]),
		);
		const result = await RevisionService.checkStorageAvailability(revision, DI);
		expect(result).toBe(false);
	});
});
