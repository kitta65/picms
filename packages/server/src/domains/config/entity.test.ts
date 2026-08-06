import { describe, expect, test } from "bun:test";
import { CONFIG_SCHEMA } from "./entity";

describe("CONFIG_SCHEMA", () => {
	test("succeed to parse valid data", () => {
		const input = {
			timezone: "UTC",
		};
		const result = CONFIG_SCHEMA.safeParse(input);
		expect(result.success).toBe(true);
		expect(result.data?.timezone).toBe("UTC");
	});

	test("fail to parse data with missing fields", () => {
		const input = {
			// no timezone
		};
		const result = CONFIG_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});

	test("invalid timezone is transformed to null", () => {
		const input = {
			timezone: "invalid timezon",
		};
		const result = CONFIG_SCHEMA.safeParse(input);
		expect(result.success).toBe(true);
		expect(result.data?.timezone).toBe(null);
	});
});
