import { COMMON_API_BASE_PATH } from "picms-server/api";
import index from "./index.html";

const { PICMS_PORT_MAIN, PICMS_PORT_WEB } = Bun.env;

const server = Bun.serve({
	routes: {
		"/*": index,

		// delegate everything
		[`${COMMON_API_BASE_PATH}/*`]: async (req) => {
			const url = new URL(req.url);
			return fetch(
				`http://localhost:${PICMS_PORT_MAIN}${url.pathname}${url.search}`,
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
	port: PICMS_PORT_WEB,
});

console.log(`🚀 Server running at ${server.url}`);
