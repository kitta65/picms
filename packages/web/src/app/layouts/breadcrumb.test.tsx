import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/app/layouts/breadcrumb";

describe("Breadcrumb", () => {
	test("does not appear in /", () => {
		window.happyDOM.setURL("http://localhost");
		render(<Breadcrumb />);
		const breadcrumb = screen.queryByLabelText("breadcrumb");
		expect(breadcrumb).not.toBeInTheDocument();
	});

	test("Home & Works appear in /works", () => {
		window.happyDOM.setURL("http://localhost/works");
		render(<Breadcrumb />);

		const breadcrumb = screen.getByLabelText("breadcrumb");
		expect(breadcrumb).toBeInTheDocument();

		const links = screen.queryAllByRole("link");
		expect(links.length).toBe(2);

		const homeLink = links.at(0);
		expect(homeLink).toHaveTextContent("Home");
		expect(homeLink).toHaveAttribute("href", "/");
		expect(homeLink).toBeEnabled();

		const worksLink = links.at(1);
		expect(worksLink).toHaveTextContent("Works");
		expect(worksLink).toHaveAttribute("aria-disabled", "true");
	});
});
