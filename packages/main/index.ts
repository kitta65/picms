import { serve } from "bun";
import index from "picms-web/dist/index.html";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const server = serve({
	routes: {
		"/*": IS_PRODUCTION ? index : Response.redirect("http://localhost:5173"),

		"/api/hello": {
			async GET(_req) {
				return Response.json({
					message: "Hello, world!",
					method: "GET",
				});
			},
			async PUT(_req) {
				return Response.json({
					message: "Hello, world!",
					method: "PUT",
				});
			},
		},

		"/api/hello/:name": async (req) => {
			const name = req.params.name;
			return Response.json({
				message: `Hello, ${name}!`,
			});
		},
	},
	port: 3000,
});

console.log(`🚀 Server running at ${server.url}`);
