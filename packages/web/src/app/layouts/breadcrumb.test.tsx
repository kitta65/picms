import { describe, expect, test } from "bun:test";
import { within } from "@testing-library/react";
import { Breadcrumb } from "@/app/layouts/breadcrumb";
import { setupComponent } from "@/test-helpers";

describe("Breadcrumb", () => {
	test("does not appear in /", () => {
		window.happyDOM.setURL("http://localhost");
		const { component } = setupComponent(<Breadcrumb />);
		const breadcrumb = component.queryByRole("navigation", {
			name: /breadcrumb/i,
		});
		expect(breadcrumb).toBe(null);
	});

	test("Home & Works appear in /works", () => {
		window.happyDOM.setURL("http://localhost/works");
		const { component } = setupComponent(<Breadcrumb />);

		const breadcrumb = component.getByRole("navigation", {
			name: /breadcrumb/i,
		});
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
