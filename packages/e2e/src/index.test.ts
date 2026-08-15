import { describe, expect, test } from "bun:test";

const { PICMS_PORT_MAIN } = Bun.env;

// you'll be redirected if required
const URL = `http://localhost:${PICMS_PORT_MAIN}`;

class Counter {
	errorLog: number;
	warnLog: number;
	exception: number;

	constructor() {
		this.errorLog = 0;
		this.warnLog = 0;
		this.exception = 0;
	}
}

function createWebView(counter?: Counter) {
	const handleConsole = (type: string) => {
		switch (type) {
			case "error":
				if (counter) ++counter.errorLog;
				return;
			case "warning":
				if (counter) ++counter.warnLog;
				return;
			case "log":
			case "info":
			case "debug":
				return;
			default:
				throw new Error(`unknown log type: ${type}`);
		}
	};

	const view = new Bun.WebView({
		backend: {
			type: "chrome",
			// in this devcontainer, --no-sandbox seems required
			argv: ["--no-sandbox"],
		},
		// https://bun.com/docs/runtime/webview#console-capture
		console: handleConsole,
	});

	// https://bun.com/docs/runtime/webview#subscribing-to-events
	view.addEventListener("Runtime.exceptionThrown", () => {
		if (counter) ++counter.exception;
	});

	return view;
}

describe("e2e", async () => {
	test("counter is incremented as expected", async () => {
		const counter = new Counter();
		await using view = createWebView(counter);
		await view.navigate(URL);
		await view.evaluate("console.error('test error')");
		await view.evaluate("console.warn('test warning')");
		// throw exception asynchronously, because synchronous execption is suppressed by evaluate()
		// https://bun.com/docs/runtime/webview#evaluating-javascript
		await view.evaluate(
			"setTimeout(() => { throw new Error('test exception') }, 0)",
		);
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(counter.errorLog).toBe(1);
		expect(counter.warnLog).toBe(1);
		expect(counter.exception).toBe(1);
	});

	test("title is PicMS", async () => {
		await using view = createWebView();
		await view.navigate(URL);
		expect(view.title).toBe("PicMS");
	});

	test("able to open /settings page", async () => {
		const counter = new Counter();
		await using view = createWebView(counter);
		await view.navigate(URL);
		await view.click('a[href="/settings"]');
		await view.click('button[type="submit"]');

		expect(counter.errorLog).toBe(0);
		expect(counter.warnLog).toBe(0);
		expect(counter.exception).toBe(0);
	});
});
