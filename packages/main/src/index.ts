import { PICMS_API } from "picms-server/api";
import { SERVER_ROUTE } from "picms-shared/constants";
import type { Awaitable } from "picms-shared/types";
import index from "picms-web/dist/index.html";

type ApiFunc = (req: Bun.BunRequest) => Awaitable<Response>;
const { PICMS_PORT_MAIN, PICMS_PORT_WEB } = Bun.env;

function createServerOptions(
	fn: {
		apiFunc?: ApiFunc;
	},
	options?: {
		port?: number;
		isProduction?: boolean;
	},
) {
	const fallbackFunc = () => new Response(null, { status: 404 });

	const routes = {
		"/*": options?.isProduction
			? index
			: Response.redirect(`http://localhost:${PICMS_PORT_WEB}`),

		[`${SERVER_ROUTE}/*`]: fn.apiFunc ?? fallbackFunc,
	};

	// 0 means random port https://bun.com/docs/runtime/http/server#changing-the-port-and-hostname
	const port_ = options?.port ?? 0;

	return { routes, port: port_ };
}

function main() {
	if (!PICMS_PORT_MAIN) {
		throw new Error("PICMS_PORT_MAIN is not specified");
	}
	const port = Number(PICMS_PORT_MAIN);
	const isProduction = Bun.env.NODE_ENV === "production";
	const options = createServerOptions(
		{
			apiFunc: (req) => PICMS_API.fetch(req),
		},
		{ port, isProduction },
	);

	const server = Bun.serve(options);
	console.log(`🚀 Server running at ${server.url}`);
}

if (import.meta.main) {
	main();
}

export const _TEST = {
	createServerOptions,
};
