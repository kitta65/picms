import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { InputTags } from "@/shared/ui/custom/input-tags";

describe("InputTags", () => {
	test("add button is disabled by default", async () => {
		const methods = render(<InputTags onChange={() => {}} tags={[]} />);

		const button = methods.getByRole("button", { name: /add/i });
		expect(button).toBeDisabled();
	});

	test("add button is still disabled when value is only space", async () => {
		const user = userEvent.setup();
		const methods = render(<InputTags onChange={() => {}} tags={[]} />);

		const textbox = methods.getByRole("textbox");
		await user.click(textbox);
		await user.keyboard(" ");

		const button = methods.getByRole("button", { name: /add/i });
		expect(button).toBeDisabled();
	});

	test("add button is enabled when value is not empty", async () => {
		const user = userEvent.setup();
		const methods = render(<InputTags onChange={() => {}} tags={[]} />);

		const textbox = methods.getByRole("textbox");
		await user.click(textbox);
		await user.keyboard("foo");

		const button = methods.getByRole("button", { name: /add/i });
		expect(button).toBeEnabled();
	});

	test("tags appear", async () => {
		const methods = render(
			<InputTags onChange={() => {}} tags={["tag1", "tag2"]} />,
		);

		const tags = methods.getAllByRole("button", { name: /tag\d/ });
		expect(tags.length).toBe(2);
	});

	test("tag is added by add button", async () => {
		function InputTagsWithNoTag() {
			const [tags, setTags] = useState<string[]>([]);
			return <InputTags onChange={setTags} tags={tags} />;
		}
		const user = userEvent.setup();
		const methods = render(<InputTagsWithNoTag />);

		const textbox = methods.getByRole("textbox");
		await user.click(textbox);
		await user.keyboard("foo");
		const button = methods.getByRole("button", { name: /add/i });
		await user.click(button);

		try {
			await methods.findByRole("button", { name: "foo" });
		} catch {
			expect.unreachable();
		}
	});

	test("tag is added by enter key", async () => {
		function InputTagsWithNoTag() {
			const [tags, setTags] = useState<string[]>([]);
			return <InputTags onChange={setTags} tags={tags} />;
		}
		const user = userEvent.setup();
		const methods = render(<InputTagsWithNoTag />);

		const textbox = methods.getByRole("textbox");
		await user.click(textbox);
		await user.keyboard("{f}{o}{o}{Enter}");

		try {
			await methods.findByRole("button", { name: "foo" });
		} catch {
			expect.unreachable();
		}
	});

	test("tag is removed when clicked", async () => {
		function InputTagsWithSingleTag() {
			const [tags, setTags] = useState(["foo"]);
			return <InputTags onChange={setTags} tags={tags} />;
		}

		const user = userEvent.setup();
		const methods = render(<InputTagsWithSingleTag />);
		const tag = methods.getByRole("button", { name: "foo" });

		expect(tag).toBeInTheDocument();
		await user.click(tag);
		expect(tag).not.toBeInTheDocument();
	});
});
