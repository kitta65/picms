import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { TestComponent } from "@/app/layouts/breadcrumb";

test("Can use Testing Library", () => {
	render(<TestComponent />);
	const myComponent = screen.getByTestId("my-first-test");
	expect(myComponent).toBeInTheDocument();
});
