import { describe, expect, test } from "bun:test";
import { useState } from "react";
import { InputTags } from "@/shared/ui/custom/input-tags";
import { setupComponent } from "@/test-helpers";

describe("InputTags", () => {
	test("add button is disabled by default", async () => {
		const { component } = setupComponent(
			<InputTags onChange={() => {}} tags={[]} />,
		);

		const button = component.getByRole("button", { name: /add/i });
		expect(button).toBeDisabled();
	});

	test("add button is still disabled when value is only space", async () => {
		const { user, component } = setupComponent(
			<InputTags onChange={() => {}} tags={[]} />,
		);

		const textbox = component.getByRole("textbox");
		await user.click(textbox);
		await user.keyboard(" ");

		const button = component.getByRole("button", { name: /add/i });
		expect(button).toBeDisabled();
	});

	test("add button is enabled when value is not empty", async () => {
		const { user, component } = setupComponent(
			<InputTags onChange={() => {}} tags={[]} />,
		);

		const textbox = component.getByRole("textbox");
		await user.click(textbox);
		await user.keyboard("foo");

		const button = component.getByRole("button", { name: /add/i });
		expect(button).toBeEnabled();
	});

	test("tags appear", async () => {
		const { component } = setupComponent(
			<InputTags onChange={() => {}} tags={["tag1", "tag2"]} />,
		);

		const tags = component.getAllByRole("button", { name: /tag\d/ });
		expect(tags.length).toBe(2);
	});

	test("tag is added by add button", async () => {
		function InputTagsWithNoTag() {
			const [tags, setTags] = useState<string[]>([]);
			return <InputTags onChange={setTags} tags={tags} />;
		}
		const { user, component } = setupComponent(<InputTagsWithNoTag />);

		const textbox = component.getByRole("textbox");
		await user.click(textbox);
		await user.keyboard("foo");
		const button = component.getByRole("button", { name: /add/i });
		await user.click(button);

		try {
			await component.findByRole("button", { name: "foo" });
		} catch {
			expect.unreachable();
		}
	});

	test("tag is not added if already exists", async () => {
		function InputTagsWithSingleTag() {
			const [tags, setTags] = useState<string[]>(["foo"]);
			return <InputTags onChange={setTags} tags={tags} />;
		}
		const { user, component } = setupComponent(<InputTagsWithSingleTag />);

		const textbox = component.getByRole("textbox");
		await user.click(textbox);
		await user.keyboard("foo");
		const button = component.getByRole("button", { name: /add/i });
		await user.click(button);

		const tags = await component.findAllByRole("button", { name: "foo" });
		expect(tags.length).toBe(1);
	});

	test("tag is added by enter key", async () => {
		function InputTagsWithNoTag() {
			const [tags, setTags] = useState<string[]>([]);
			return <InputTags onChange={setTags} tags={tags} />;
		}
		const { user, component } = setupComponent(<InputTagsWithNoTag />);

		const textbox = component.getByRole("textbox");
		await user.click(textbox);
		await user.keyboard("{f}{o}{o}{Enter}");

		try {
			await component.findByRole("button", { name: "foo" });
		} catch {
			expect.unreachable();
		}
	});

	test("tag is removed when clicked", async () => {
		function InputTagsWithSingleTag() {
			const [tags, setTags] = useState(["foo"]);
			return <InputTags onChange={setTags} tags={tags} />;
		}

		const { user, component } = setupComponent(<InputTagsWithSingleTag />);
		const tag = component.getByRole("button", { name: "foo" });

		expect(tag).toBeInTheDocument();
		await user.click(tag);
		expect(tag).not.toBeInTheDocument();
	});
});
