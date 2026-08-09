import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import { PICMS_API, type PicmsApi } from "picms-server/api";
import { Settings } from "@/pages/settings";
import { ApiClientContext } from "@/shared/api";

const MOCK = new Hono()
	.get("/api/private/configs", (c) => c.body(null, 500))
	.use(async (c) => c.body(null, 501))
	.route("/*", PICMS_API) as PicmsApi;

const MOCK_CLIENT = testClient(MOCK);
const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: false } },
});

describe("Settings", () => {
	test("", async () => {
		const { findAllByRole } = render(
			<QueryClientProvider client={queryClient}>
				<ApiClientContext value={MOCK_CLIENT}>
					<Settings />
				</ApiClientContext>
			</QueryClientProvider>,
		);

		try {
			await findAllByRole("link", { name: /report issue/i });
		} catch {
			expect.unreachable();
		}
	});
});
