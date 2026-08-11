import { describe, expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import { Breadcrumb } from "@/app/layouts/breadcrumb";

describe("Breadcrumb", () => {
	test("does not appear in /", () => {
		window.happyDOM.setURL("http://localhost");
		render(<Breadcrumb />);
		const breadcrumb = screen.queryByRole("navigation", {
			name: /breadcrumb/i,
		});
		expect(breadcrumb).toBe(null);
	});

	test("Home & Works appear in /works", () => {
		window.happyDOM.setURL("http://localhost/works");
		render(<Breadcrumb />);

		const breadcrumb = screen.getByRole("navigation", { name: /breadcrumb/i });
		expect(breadcrumb).toBeInTheDocument();

		const links = within(breadcrumb).getAllByRole("link");
		expect(links.length).toBe(2);

		const [homeLink, worksLink] = links;
		if (!homeLink || !worksLink) {
			expect.unreachable();
		}

		expect(homeLink).toHaveTextContent("Home");
		expect(homeLink).toHaveAttribute("href", "/");
		expect(homeLink).toBeEnabled();

		expect(worksLink).toHaveTextContent("Works");
		expect(worksLink).toHaveAttribute("aria-disabled", "true");
	});
});
