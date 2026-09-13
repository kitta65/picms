import { describe, expect, test } from "bun:test";
import { _TEST as APP_TEST } from "@/app/App";
import { DateWithTz } from "@/shared/ui/custom/date-with-tz";
import { setupComponent } from "@/test-helpers";

const DATE_ZERO = new Date(0); // 1970-01-01T00:00:00.000Z
function Wrapper({ children }: { children: React.ReactNode }) {
	return APP_TEST.Wrapper({
		children,
		options: {
			shouldRetry: false,
		},
	});
}

describe("DateWithTz", () => {
	test("Asia/Tokyo style timezone is handled properly", () => {
		const { component } = setupComponent(
			<Wrapper>
				<DateWithTz date={DATE_ZERO} timezone={"Asia/Tokyo"} />
			</Wrapper>,
		);

		try {
			component.getByText(/1970-01-01 09:00:00/);
		} catch {
			expect.unreachable();
		}
	});

	test("Etc/GMT-9 style timezone is handled properly", () => {
		const { component } = setupComponent(
			<Wrapper>
				<DateWithTz date={DATE_ZERO} timezone={"Etc/GMT-9"} />
			</Wrapper>,
		);

		try {
			component.getByText(/1970-01-01 09:00:00/);
		} catch {
			expect.unreachable();
		}
	});

	test("does not crash even if timezone is not specified", () => {
		const { component } = setupComponent(
			<Wrapper>
				<DateWithTz date={DATE_ZERO} />
			</Wrapper>,
		);

		try {
			// text defers depending on the timezone
			component.getByText(/19\d\d-\d\d-\d\d \d\d:\d\d:\d\d/);
		} catch {
			expect.unreachable();
		}
	});
});
