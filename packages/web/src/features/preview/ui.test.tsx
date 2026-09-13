import { describe, expect, test } from "bun:test";
import type { IPreviewable } from "@/features/preview/model";
import { Preview } from "@/features/preview/ui";
import { setupComponent } from "@/test-helpers";

const VALID_PREVIEWABLE = {
	revisionId: Bun.randomUUIDv7(),
} satisfies IPreviewable;

describe("Preview", () => {
	test("Not found message appears when revsionId is null", () => {
		const previewable: IPreviewable = {
			...VALID_PREVIEWABLE,
			revisionId: null,
		};
		const { component } = setupComponent(
			<Preview
				data={previewable}
				isOpen={true}
				setIsOpen={() => {}}
				currPage={1}
				lastPage={1}
			/>,
		);

		try {
			component.getByText(/not found/i);
		} catch {
			expect.unreachable();
		}
	});

	test("left button is disable if onPrev is not specified", async () => {
		const { component } = setupComponent(
			<Preview
				data={VALID_PREVIEWABLE}
				isOpen={true}
				setIsOpen={() => {}}
				currPage={1}
				lastPage={1}
				onNext={() => console.log("NOP")}
			/>,
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
			<Preview
				data={VALID_PREVIEWABLE}
				isOpen={true}
				setIsOpen={() => {}}
				currPage={1}
				lastPage={1}
				onPrev={() => console.log("NOP")}
			/>,
		);

		const previous = await component.findByRole("button", {
			name: /previous/i,
		});
		expect(previous).toBeEnabled();

		const next = await component.findByRole("button", { name: /next/i });
		expect(next).toBeDisabled();
	});
});
