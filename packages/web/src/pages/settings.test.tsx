import { describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import type { PicmsApi } from "picms-server/api";
import type { UpsertInput } from "picms-server/features/config/io";
import { _TEST as APP_TEST } from "@/app/App";
import { Settings } from "@/pages/settings";
import type { ApiClient } from "@/shared/api";

const FAKE_API = new Hono()
	// mock implementation is required
	.use(async (c) => c.body(null, 501)) as unknown as PicmsApi;

const FAKE_API_CLIENT = testClient(FAKE_API);

function Wrapper({
	children,
	apiClient,
}: {
	children: React.ReactNode;
	apiClient?: ApiClient;
}) {
	return APP_TEST.Wrapper({
		children,
		options: {
			shouldRetry: false,
			apiClient: apiClient ?? FAKE_API_CLIENT,
		},
	});
}

describe("Settings", () => {
	test("show error page if server returns 501", async () => {
		const { findAllByRole } = render(
			<Wrapper>
				<Settings />
			</Wrapper>,
		);
		try {
			await findAllByRole("link", { name: /report issue/i });
		} catch {
			expect.unreachable();
		}
	});

	test("show settings form if server returns valid response", async () => {
		const api = new Hono()
			.get("/api/private/configs", (c) => {
				return c.json({ timezone: null } satisfies UpsertInput);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const client = testClient(api);

		// to avoid `not wrapped in act` warning
		await act(async () => {
			render(
				<Wrapper apiClient={client}>
					<Settings />
				</Wrapper>,
			);
		});

		try {
			await screen.findByRole("button", { name: /submit/i });
		} catch {
			expect.unreachable();
		}
	});

	test("invalid timezone from server is converted to empty value", async () => {
		const api = new Hono()
			.get("/api/private/configs", (c) => {
				return c.json({ timezone: "foo/bar" } satisfies UpsertInput);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const client = testClient(api);

		await act(async () => {
			render(
				<Wrapper apiClient={client}>
					<Settings />
				</Wrapper>,
			);
		});

		const combobox = await screen.findByLabelText(/timezone/i);
		expect(combobox).toHaveValue("");
	});

	test("valid timezone from server is set as value", async () => {
		const api = new Hono()
			.get("/api/private/configs", (c) => {
				return c.json({ timezone: "Asia/Tokyo" } satisfies UpsertInput);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const client = testClient(api);

		await act(async () => {
			render(
				<Wrapper apiClient={client}>
					<Settings />
				</Wrapper>,
			);
		});

		const combobox = await screen.findByLabelText(/timezone/i);
		expect(combobox).toHaveValue("Asia/Tokyo");
	});

	test("can submit valid value", async () => {
		let submitCounter = 0;
		const api = new Hono()
			.get("/api/private/configs", (c) => {
				return c.json({ timezone: null } satisfies UpsertInput);
			})
			.post("/api/private/configs", (c) => {
				submitCounter++;
				return c.body(null, 200);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const client = testClient(api);

		await act(async () => {
			render(
				<Wrapper apiClient={client}>
					<Settings />
				</Wrapper>,
			);
		});

		// fill form
		const combobox = await screen.findByLabelText(/timezone/i);
		await userEvent.click(combobox);
		const option = await screen.findByRole("option", { name: "Asia/Tokyo" });
		await userEvent.click(option);

		// submit
		const button = await screen.findByRole("button", { name: /submit/i });
		await userEvent.click(button);
		await screen.findByText(/saved/i); // sonner
		expect(submitCounter).toBe(1);
	});

	test("cannot submit invalid value", async () => {
		const api = new Hono()
			.get("/api/private/configs", (c) => {
				return c.json({ timezone: null } satisfies UpsertInput);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const client = testClient(api);

		await act(async () => {
			render(
				<Wrapper apiClient={client}>
					<Settings />
				</Wrapper>,
			);
		});

		const button = await screen.findByRole("button", { name: /submit/i });
		await userEvent.click(button);

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/invalid input/i);
	});

	test("focus combobox after label is clicked", async () => {
		const api = new Hono()
			.get("/api/private/configs", (c) => {
				return c.json({ timezone: null } satisfies UpsertInput);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const client = testClient(api);

		await act(async () => {
			render(
				<Wrapper apiClient={client}>
					<Settings />
				</Wrapper>,
			);
		});

		const combobox: HTMLInputElement =
			await screen.findByLabelText(/timezone/i);
		expect(combobox).not.toHaveFocus();

		const label = combobox.labels?.[0];
		if (!label || combobox.labels.length !== 1) {
			expect.unreachable();
		}

		await userEvent.click(label);
		expect(combobox).toHaveFocus();
	});
});
