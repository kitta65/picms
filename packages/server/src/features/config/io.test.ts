import { describe, expect, test } from "bun:test";
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
		} satisfies UpsertInput;
		const result = UPSERT_INPUT_SCHEMA.parse(input);
		expect(result).toStrictEqual(input);
	});

	test("invalid timezone (foo/bar) throws an error", () => {
		const input = {
			timezone: "foo/bar",
		} satisfies UpsertInput;
		const result = UPSERT_INPUT_SCHEMA.safeParse(input);

		expect(result.success).toBe(false);
	});

	test("invalid timezone (empty string) throws an error", () => {
		const input = {
			timezone: "",
		} satisfies UpsertInput;
		const result = UPSERT_INPUT_SCHEMA.safeParse(input);

		expect(result.success).toBe(false);
	});

	test("invalid timezone (null) throws an error", () => {
		const input = {
			timezone: null,
		} satisfies UpsertInput;
		const result = UPSERT_INPUT_SCHEMA.safeParse(input);

		expect(result.success).toBe(false);
	});

	test("invalid timezone (number) throws an error", () => {
		// biome-ignore lint: intentional any
		const timezone: any = 0;
		const input = {
			timezone,
		} satisfies UpsertInput;
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
		const input = {} satisfies UpsertInput;
		const entity = UpsertInput.toEntity(input);
		expect(entity).toStrictEqual({ timezone: null });
	});

	test("full input is coverted as is", () => {
		const input = {
			timezone: "Asia/Tokyo",
		} satisfies UpsertInput;
		const entity = UpsertInput.toEntity(input);
		expect(entity).toStrictEqual(input);
	});
});
