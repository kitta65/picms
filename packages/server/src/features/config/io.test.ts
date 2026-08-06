import { describe, expect, test } from "bun:test";
import type { Config } from "../../domains/config/entity";
import { UPSERT_INPUT_SCHEMA, UpsertInput } from "./io";

describe("UPSERT_INPUT_SCHEMA", () => {
	test("succeed to parse valid input (minimum)", () => {
		const input = {};
		const result = UPSERT_INPUT_SCHEMA.parse(input);

		expect(result).toStrictEqual(input);
	});

	test("succeed to parse valid input (full)", () => {
		const input = {
			timezone: "Asia/Tokyo",
		} satisfies Config;
		const result = UPSERT_INPUT_SCHEMA.parse(input);
		expect(result).toStrictEqual(input);
	});

	test("invalid timezone (string) is transformed to null", () => {
		const input = {
			timezone: "foo/bar",
		};
		const result = UPSERT_INPUT_SCHEMA.parse(input);

		expect(result.timezone).toBe(null);
	});

	test("invalid timezone (number) throw an error", () => {
		const input = {
			timezone: 0,
		};
		const result = UPSERT_INPUT_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});

	test("unnecessary fields are removed", () => {
		const input = {
			foo: "bar",
		};
		const result = UPSERT_INPUT_SCHEMA.parse(input);
		expect("foo" in result).toStrictEqual(false);
	});
});

describe("UpsertInput.toEntity", () => {
	test("missing timezone is filled with default value", () => {
		const input = {};
		const entity = UpsertInput.toEntity(input);
		expect(entity).toStrictEqual({ timezone: null });
	});

	test("full input is coverted as is", () => {
		const input = {
			timezone: "Asia/Tokyo",
		} satisfies Config;
		const entity = UpsertInput.toEntity(input);
		expect(entity).toStrictEqual(input);
	});
});
