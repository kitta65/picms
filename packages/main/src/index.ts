import { PRIVATE_API, PUBLIC_API, STORAGE_API } from "picms-server/api";
import {
	PRIVATE_API_BASE_PATH,
	PUBLIC_API_BASE_PATH,
	STORAGE_API_BASE_PATH,
} from "picms-server/constants";
import type { Awaitable } from "picms-shared/types";
import index from "picms-web/dist/index.html";

type ApiFunc = (req: Bun.BunRequest) => Awaitable<Response>;
const { PICMS_PORT_MAIN, PICMS_PORT_WEB } = Bun.env;

function createServerOptions(
	{
		privateApiFunc,
		publicApiFunc,
		storageApiFunc,
		port,
	}: {
		privateApiFunc?: ApiFunc;
		publicApiFunc?: ApiFunc;
		storageApiFunc?: ApiFunc;
		port?: number;
	},
	isProduction = false,
) {
	const fallbackFunc = () => new Response(null, { status: 404 });

	const routes = {
		"/*": isProduction
			? index
			: Response.redirect(`http://localhost:${PICMS_PORT_WEB}`),

		[`${PRIVATE_API_BASE_PATH}/*`]: privateApiFunc ?? fallbackFunc,
		[`${PUBLIC_API_BASE_PATH}/*`]: publicApiFunc ?? fallbackFunc,
		[`${STORAGE_API_BASE_PATH}/*`]: storageApiFunc ?? fallbackFunc,
	};

	// 0 means random port https://bun.com/docs/runtime/http/server#changing-the-port-and-hostname
	const port_ = port ?? 0;

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
			privateApiFunc: (req) => PRIVATE_API.fetch(req),
			publicApiFunc: (req) => PUBLIC_API.fetch(req),
			storageApiFunc: (req) => STORAGE_API.fetch(req),
			port,
		},
		isProduction,
	);

	const server = Bun.serve(options);
	console.log(`🚀 Server running at ${server.url}`);
}

if (import.meta.main) {
	main();
}

export const TEST = {
	createServerOptions,
};
