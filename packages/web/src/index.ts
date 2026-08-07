import { SERVER_ROUTE } from "picms-shared/constants";
import index from "./index.html";

const { PICMS_PORT_MAIN, PICMS_PORT_WEB } = Bun.env;

const server = Bun.serve({
	routes: {
		"/*": index,

		// delegate everything
		[`${SERVER_ROUTE}/*`]: async (req) => {
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
