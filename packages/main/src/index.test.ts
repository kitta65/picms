import { describe, expect, test } from "bun:test";
import { createServerOptions } from ".";

describe("createServerOptions", () => {
	test("/api/private/foo is routed to private api function", async () => {
		const options = createServerOptions({
			privateApiFunc: () => new Response(null, { status: 200 }),
		});
		const server = Bun.serve(options);
		const res = await fetch(new URL("/api/private/foo", server.url));
		expect(res.status).toBe(200);
	});

	test("/api/public/foo is routed to public api function", async () => {
		const options = createServerOptions({
			publicApiFunc: () => new Response(null, { status: 200 }),
		});
		const server = Bun.serve(options);
		const res = await fetch(new URL("/api/public/foo", server.url));
		expect(res.status).toBe(200);
	});

	test("/api/storage/foo is routed to storage api function", async () => {
		const options = createServerOptions({
			storageApiFunc: () => new Response(null, { status: 200 }),
		});
		const server = Bun.serve(options);
		const res = await fetch(new URL("/api/storage/foo", server.url));
		expect(res.status).toBe(200);
	});

	test("/api/private/foo returns 404 when private api function is not given", async () => {
		const options = createServerOptions({});
		const server = Bun.serve(options);
		const res = await fetch(new URL("/api/private/foo", server.url));
		expect(res.status).toBe(404);
	});

	test("/api/public/foo returns 404 when public api function is not given", async () => {
		const options = createServerOptions({});
		const server = Bun.serve(options);
		const res = await fetch(new URL("/api/public/foo", server.url));
		expect(res.status).toBe(404);
	});

	test("/api/storage/foo returns 404 when storage api function is not given", async () => {
		const options = createServerOptions({});
		const server = Bun.serve(options);
		const res = await fetch(new URL("/api/storage/foo", server.url));
		expect(res.status).toBe(404);
	});

	test("/foo is routed to index.html (production)", async () => {
		const options = createServerOptions({}, true);
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
