import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { ERROR_CODE } from "../../constants";
import { _TEST, SharedStorage } from "./repositories";

const TEMP_DIR_NAME = "local-repository-test";
const { BASE_PATH } = _TEST;

async function cleanUp() {
	const path_ = path.resolve(BASE_PATH, TEMP_DIR_NAME);
	await fs.rm(path_, { recursive: true, force: true });
}

beforeAll(async () => {
	await cleanUp();
});

afterAll(async () => {
	await cleanUp();
});

describe("issueSignedUrl", () => {
	test("issued url is expected format", async () => {
		const storage = new SharedStorage("https://example.com", TEMP_DIR_NAME);
		const url = await storage.issueSignedUrl("foo");

		const expected =
			/^https:\/\/example\.com\/local-repository-test\/foo\?token=[0-9a-f]{72}$/;
		const result = expected.test(url);

		expect(result).toBe(true);
	});

	test("sign is stored in expected format", async () => {
		const storage = new SharedStorage("", TEMP_DIR_NAME);
		const dateBeforeOperation = new Date();
		await storage.issueSignedUrl("foo");
		const dateAfterOperation = new Date();
		const { resourceId, token, signedAt } = SharedStorage.sign;

		expect(resourceId).toBe("foo");
		const tokenRegexp = /^[0-9a-f]{72}$/;
		expect(tokenRegexp.test(token)).toBe(true);
		expect(Number(signedAt)).toBeGreaterThanOrEqual(
			Number(dateBeforeOperation),
		);
		expect(Number(signedAt)).toBeLessThanOrEqual(Number(dateAfterOperation));
	});
});

describe("checkAvailability", () => {
	test("true if new uuid is specified", async () => {
		const storage = new SharedStorage("", TEMP_DIR_NAME);
		const uuid = Bun.randomUUIDv7();
		const result = await storage.checkAvailability(uuid);

		expect(result).toBe(true);
	});

	test("false if uuid is specified twice", async () => {
		const storage = new SharedStorage("", TEMP_DIR_NAME, {
			skipValidation: true,
		});
		const id = Bun.randomUUIDv7();
		await storage.save(id, "", new Blob(["dummy blob data"]));
		const result = await storage.checkAvailability(id);

		expect(result).toBe(false);
	});
});

describe("save", () => {
	test("saved data exists", async () => {
		// save data
		const storage = new SharedStorage("", TEMP_DIR_NAME, {
			skipValidation: true,
		});
		const uuid = Bun.randomUUIDv7();
		const data = "dummy data";
		await storage.save(uuid, "", new Blob([data]));

		// read data
		const path_ = path.join(BASE_PATH, "local-repository-test", uuid);
		const result = await fs.readFile(path_, { encoding: "utf-8" });

		// assertion
		expect(result).toBe(data);
	});

	test("old token is rejected", async () => {
		const storage = new SharedStorage("", TEMP_DIR_NAME);
		await storage.issueSignedUrl("foo");
		SharedStorage.sign.signedAt = new Date(0);

		await expect(
			storage.save(
				SharedStorage.sign.resourceId,
				SharedStorage.sign.token,
				new Blob(["dummy"]),
			),
		).rejects.toThrow(ERROR_CODE.UNAUTHORIZED.message);
	});

	test("cannot save using invalid token", async () => {
		const storage = new SharedStorage("", TEMP_DIR_NAME);
		await expect(
			storage.save("foo", "invalid token", new Blob(["dummy"])),
		).rejects.toThrow(ERROR_CODE.UNAUTHORIZED.message);
	});
});

describe("deleteById", () => {
	test("deleted data does not exist", async () => {
		// save data
		const uuid = Bun.randomUUIDv7();
		const storage = new SharedStorage("", TEMP_DIR_NAME, {
			skipValidation: true,
		});
		await storage.save(uuid, "", new Blob(["data"]));
		const path_ = path.join(BASE_PATH, TEMP_DIR_NAME, uuid);
		const existsBeforeDelete = await fs.exists(path_);
		expect(existsBeforeDelete).toBe(true);

		// delete data
		await storage.deleteById(uuid);
		const existsAfterDelete = await fs.exists(path_);
		expect(existsAfterDelete).toBe(false);
	});
});
