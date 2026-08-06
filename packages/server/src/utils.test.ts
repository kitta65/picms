import { describe, expect, test } from "bun:test";
import { getRootUrl } from "./utils";

describe("getRootUrl", () => {
	test("return the input as is if the path is `/`", async () => {
		const url = "http://example.com";
		const req = new Request(url);
		const res = getRootUrl(req);

		expect(res).toBe(url);
	});

	test("unnecessary path is removed", () => {
		const req = new Request("http://example.com/foo/bar");
		const res = getRootUrl(req);

		expect(res).toBe("http://example.com");
	});

	test("port number is also included", () => {
		const url = "http://example.com:8080";
		const req = new Request(url);
		const res = getRootUrl(req);

		expect(res).toBe(url);
	});
});
