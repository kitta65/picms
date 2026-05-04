import { serve } from "bun";
import { PACKAGE, PORT } from "picms-common/constants";
import index from "./index.html";

const server = serve({
	// delegate everything except for index.html
	routes: {
		"/": index,
		"/*": async (req) => {
			const url = new URL(req.url);
			return fetch(
				`http://localhost:${PORT[PACKAGE.MAIN]}${url.pathname}?${url.search}`,
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
