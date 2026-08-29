import { describe, expect, test } from "bun:test";
import type { IPreviewable } from "@/features/preview/model";
import { Preview } from "@/features/preview/ui";
import { setupComponent } from "@/test-helpers";

const VALID_PREVIEWABLE = {
	id: Bun.randomUUIDv7(),
	url: "https://example.com",
} satisfies IPreviewable;

const TRIGGER_ID = Bun.randomUUIDv7();
const TRIGGER = (
	<button type="button" data-testid={TRIGGER_ID}>
		click
	</button>
);

describe("Preview", () => {
	test("left button is disable if onPrev is not specified", async () => {
		const { user, component } = setupComponent(
			<Preview
				trigger={TRIGGER}
				data={VALID_PREVIEWABLE}
				currPage={1}
				lastPage={1}
				onNext={() => console.log("NOP")}
			/>,
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

	test("right button is disable if onNext is not specified", async () => {
		const { user, component } = setupComponent(
			<Preview
				trigger={TRIGGER}
				data={VALID_PREVIEWABLE}
				currPage={1}
				lastPage={1}
				onPrev={() => console.log("NOP")}
			/>,
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
