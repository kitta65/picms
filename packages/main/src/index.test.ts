import { describe, expect, test } from "bun:test";
import { _TEST } from ".";

const { createServerOptions } = _TEST;

describe("createServerOptions", () => {
	test("/api/foo is routed to api function", async () => {
		const options = createServerOptions({
			apiFunc: () => new Response(null, { status: 200 }),
		});
		const server = Bun.serve(options);
		const res = await fetch(new URL("/api/foo", server.url));
		expect(res.status).toBe(200);
	});

	test("/api/foo returns 404 when storage api function is not given", async () => {
		const options = createServerOptions({});
		const server = Bun.serve(options);
		const res = await fetch(new URL("/api/foo", server.url));
		expect(res.status).toBe(404);
	});

	test("/foo is routed to index.html (production)", async () => {
		const options = createServerOptions({}, { isProduction: true });
		const server = Bun.serve(options);
		const res = await fetch(new URL("/foo", server.url));
		const contentType = res.headers.get("content-type");
		expect(contentType).toContain("text/html");
	});

	test("/foo is redirected (development)", async () => {
		const options = createServerOptions({});
		const server = Bun.serve(options);
		const res = await fetch(new URL("/foo", server.url), {
			redirect: "manual",
		});
		expect(res.status).toBe(302);
	});
});
