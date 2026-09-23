import { PICMS_API } from "picms-server/api";
import { SERVER_ROUTE } from "picms-shared/constants";
import type { Awaitable } from "picms-shared/types";
import index from "picms-web/dist/index.html";
import { PicmsOptions } from "./options";

type ApiFunc = (req: Bun.BunRequest) => Awaitable<Response>;
const { PICMS_PORT_WEB } = Bun.env;

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
	// TODO: support command line arguments
	const picmsOptions = PicmsOptions.fromEnv(Bun.env);
	const isProduction = process.env.NODE_ENV === "production";
	const serverOptions = createServerOptions(
		{
			apiFunc: (req) => PICMS_API.fetch(req),
		},
		{ port: picmsOptions.portMain, isProduction },
	);

	const server = Bun.serve(serverOptions);
	console.log(`🚀 Server running at ${server.url}`);
}

if (import.meta.main) {
	main();
}

export const forTesting = {
	createServerOptions,
};
