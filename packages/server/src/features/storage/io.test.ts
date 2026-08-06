import { describe, expect, test } from "bun:test";
import { REVISION_POST_SCHEMA } from "./io";

const VALID_INPUT = { id: Bun.randomUUIDv7() } as const;

describe("REVISION_POST_SCHEMA", () => {
	test("succeed to parse valid input", () => {
		const input = VALID_INPUT;
		const result = REVISION_POST_SCHEMA.parse(input);
		expect(result).toStrictEqual(input);
	});

	test("fail to parse input with missing field", () => {
		const input = {};
		const result = REVISION_POST_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});

	test("fail to parse input with invalid uuid", () => {
		const input = { id: "foo/bar" } satisfies typeof VALID_INPUT;
		const result = REVISION_POST_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});
});
