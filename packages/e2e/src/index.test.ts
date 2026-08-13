import { describe, expect, test } from "bun:test";

const { NODE_ENV, PICMS_PORT_MAIN, PICMS_PORT_WEB } = Bun.env;

const URL =
	NODE_ENV === "production"
		? `http://localhost:${PICMS_PORT_WEB}`
		: `http://localhost:${PICMS_PORT_MAIN}`;

describe("e2e", async () => {
	await using view = new Bun.WebView({
		backend: {
			type: "chrome",
			// in this devcontainer, --no-sandbox seems required
			argv: ["--no-sandbox"],
		},
	});
	await view.navigate(URL);

	test("TODO", () => {
		expect(1 + 1).toBe(2);
	});
});
