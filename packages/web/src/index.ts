import { serve } from "bun";
import index from "./index.html";

const server = serve({
	// delegate everything except for index.html
	routes: {
		"/": index,
		"/*": async (req) => {
			const url = new URL(req.url);
			return fetch(`http://localhost:3000${url.pathname}?${url.search}`, req);
		},
	},

	development: process.env.NODE_ENV !== "production" && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
	port: 5173,
});

console.log(`🚀 Server running at ${server.url}`);
