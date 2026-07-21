import {
	PRIVATE_API,
	PRIVATE_API_BASE_PATH,
	PUBLIC_API,
	PUBLIC_API_BASE_PATH,
	STORAGE_API,
	STORAGE_API_BASE_PATH,
} from "picms-server/api";
import { PACKAGE, PORT } from "picms-shared/constants";
import index from "picms-web/dist/index.html";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const server = Bun.serve({
	routes: {
		"/*": IS_PRODUCTION
			? index
			: Response.redirect(`http://localhost:${PORT[PACKAGE.WEB]}`),

		[`${PRIVATE_API_BASE_PATH}/*`]: async (req) => PRIVATE_API.fetch(req),
		[`${PUBLIC_API_BASE_PATH}/*`]: async (req) => PUBLIC_API.fetch(req),
		[`${STORAGE_API_BASE_PATH}/*`]: async (req) => STORAGE_API.fetch(req),
	},
	port: PORT[PACKAGE.MAIN],
});

console.log(`🚀 Server running at ${server.url}`);
