import { serve } from "bun";
import { COMMON_API_BASE_PATH } from "picms-server/api";
import { PACKAGE, PORT } from "picms-shared/constants";
import index from "./index.html";

const server = serve({
	routes: {
		"/*": index,

		// delegate everything
		[`${COMMON_API_BASE_PATH}/*`]: async (req) => {
			const url = new URL(req.url);
			return fetch(
				`http://localhost:${PORT[PACKAGE.MAIN]}${url.pathname}${url.search}`,
				req,
			);
		},
	},

	development: process.env.NODE_ENV !== "production" && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
	port: PORT[PACKAGE.WEB],
});

console.log(`🚀 Server running at ${server.url}`);
