import { PACKAGE, PORT, ROUTE } from "picms-common/constants";
import { app } from "picms-server";
import index from "picms-web/dist/index.html";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const server = Bun.serve({
	routes: {
		"/*": IS_PRODUCTION
			? index
			: Response.redirect(`http://localhost:${PORT[PACKAGE.WEB]}`),

		[ROUTE[PACKAGE.SERVER]]: async (req) => {
			return app.fetch(req);
		},
	},
	port: PORT[PACKAGE.MAIN],
});

console.log(`🚀 Server running at ${server.url}`);
