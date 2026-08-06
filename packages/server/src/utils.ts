// NOTE: currently headers (e.g. x-forwarded-proto) are not considered
export function getRootUrl(req: Request) {
	const url = new URL(req.url);
	const proto = url.protocol;
	const host = url.host;

	return `${proto}//${host}`;
}
