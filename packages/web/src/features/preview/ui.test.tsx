import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import type { PicmsApi } from "picms-server/api";
import { _TEST as APP_TEST } from "@/app/App";
import type { IPreviewable } from "@/features/preview/model";
import { Preview } from "@/features/preview/ui";
import type { ApiClient } from "@/shared/api";
import { setupComponent } from "@/test-helpers";

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

const VALID_PREVIEWABLE = {
	revisionId: Bun.randomUUIDv7(),
} satisfies IPreviewable;

describe("Preview", () => {
	test("left button is disable if onPrev is not specified", async () => {
		const { component } = setupComponent(
			<Wrapper>
				<Preview
					data={VALID_PREVIEWABLE}
					isOpen={true}
					setIsOpen={() => {}}
					currPage={1}
					lastPage={1}
					onNext={() => console.log("NOP")}
				/>
			</Wrapper>,
		);

		const previous = await component.findByRole("button", {
			name: /previous/i,
		});
		expect(previous).toBeDisabled();

		const next = await component.findByRole("button", { name: /next/i });
		expect(next).toBeEnabled();
	});

	test("right button is disable if onNext is not specified", async () => {
		const { component } = setupComponent(
			<Wrapper>
				<Preview
					data={VALID_PREVIEWABLE}
					isOpen={true}
					setIsOpen={() => {}}
					currPage={1}
					lastPage={1}
					onPrev={() => console.log("NOP")}
				/>
			</Wrapper>,
		);

		const previous = await component.findByRole("button", {
			name: /previous/i,
		});
		expect(previous).toBeEnabled();

		const next = await component.findByRole("button", { name: /next/i });
		expect(next).toBeDisabled();
	});
});
