import { describe, expect, test } from "bun:test";
import type { IPreviewable } from "@/features/preview/model";
import { Preview } from "@/features/preview/ui";
import { setupComponent } from "@/test-helpers";

const VALID_PREVIEWABLES: IPreviewable[] = [
	{ id: Bun.randomUUIDv7(), url: "https://example.com" },
	{ id: Bun.randomUUIDv7(), url: "https://example.com" },
	{ id: Bun.randomUUIDv7(), url: "https://example.com" },
];

const TRIGGER_ID = Bun.randomUUIDv7();
const TRIGGER = (
	<button type="button" data-testid={TRIGGER_ID}>
		click
	</button>
);

describe("Preview", () => {
	test("buttons are enabled at the middle content", async () => {
		const { user, component } = setupComponent(
			<Preview baseIdx={1} data={VALID_PREVIEWABLES} trigger={TRIGGER} />,
		);

		const trigger = component.getByTestId(TRIGGER_ID);
		await user.click(trigger);

		const previous = await component.findByRole("button", {
			name: /previous/i,
		});
		expect(previous).toBeEnabled();

		const next = await component.findByRole("button", { name: /next/i });
		expect(next).toBeEnabled();
	});
	test("left button is disable at first content", async () => {
		const { user, component } = setupComponent(
			<Preview baseIdx={0} data={VALID_PREVIEWABLES} trigger={TRIGGER} />,
		);

		const trigger = component.getByTestId(TRIGGER_ID);
		await user.click(trigger);

		const previous = await component.findByRole("button", {
			name: /previous/i,
		});
		expect(previous).toBeDisabled();

		const next = await component.findByRole("button", { name: /next/i });
		expect(next).toBeEnabled();
	});
	test("right button is disable at last content", async () => {
		const lastIdx = VALID_PREVIEWABLES.length - 1;
		const { user, component } = setupComponent(
			<Preview baseIdx={lastIdx} data={VALID_PREVIEWABLES} trigger={TRIGGER} />,
		);

		const trigger = component.getByTestId(TRIGGER_ID);
		await user.click(trigger);

		const previous = await component.findByRole("button", {
			name: /previous/i,
		});
		expect(previous).toBeEnabled();

		const next = await component.findByRole("button", { name: /next/i });
		expect(next).toBeDisabled();
	});
});
