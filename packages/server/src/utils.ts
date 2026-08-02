import type { HonoRequest } from "hono";

export function getRootUrl(req: HonoRequest) {
	const requestUrl = new URL(req.url);
	const protocol =
		req.header("x-forwarded-proto") ||
		req.header("forwarded")?.match(/proto=([^;]+)/)?.[1] ||
		requestUrl.protocol.replace(":", "");
	const host =
		req.header("x-forwarded-host") ||
		req.header("forwarded")?.match(/host=([^;]+)/)?.[1] ||
		requestUrl.host;
	return `${protocol}://${host}`;
}
