import { describe, expect, test } from "bun:test";

import * as localStorage from "../../infrastructures/local/repositories";
import type { Revision } from "./entity";
import * as RevisionService from "./service";

class TestStorage extends localStorage._TEST.SharedStorage {
	directory = "revision-service-test";
	constructor() {
		super("dummy/api/base/url", { skipValidation: true });
	}
}

const DI = {
	revisionStorage: new TestStorage(),
};

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
