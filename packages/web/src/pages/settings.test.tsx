import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import { PICMS_API, type PicmsApi } from "picms-server/api";
import type { ReadSchema } from "picms-server/features/config/io";
import { _TEST as APP_TEST } from "@/app/App";
import { Settings } from "@/pages/settings";
import type { ApiClient } from "@/shared/api";

const FAKE_API = new Hono()
	.use(async (c) => c.body(null, 501)) // mock implementation is required
	.route("/*", PICMS_API) as PicmsApi;

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
			isStrict: false,
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

		const { findByRole } = render(
			<Wrapper apiClient={client}>
				<Settings />
			</Wrapper>,
		);

		try {
			await findByRole("button", { name: /submit/i });
		} catch {
			expect.unreachable();
		}
	});
});
