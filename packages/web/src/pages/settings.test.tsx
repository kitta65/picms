import { describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import type { PicmsApi } from "picms-server/api";
import type { ReadSchema } from "picms-server/features/config/io";
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
				return c.json({ timezone: null } satisfies ReadSchema);
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
				return c.json({ timezone: "foo/bar" } satisfies ReadSchema);
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
				return c.json({ timezone: "Asia/Tokyo" } satisfies ReadSchema);
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

	test("focus combobox after label is clicked", async () => {
		const api = new Hono()
			.get("/api/private/configs", (c) => {
				return c.json({ timezone: null } satisfies ReadSchema);
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
