import { describe, expect, test } from "bun:test";
import type { Work } from "../../domains/work/entity";
import { CREATE_INPUT_SCHEMA, CreateInput } from "./io";

const VALID_INPUT = {
	title: "foobar",
	description: "",
	public: true,
} satisfies Partial<Work>;

describe("CREATE_INPUT_SCHEMA", () => {
	test("succeed to parse valid input", () => {
		const result = CREATE_INPUT_SCHEMA.parse(VALID_INPUT);
		expect(result).toStrictEqual(VALID_INPUT);
	});

	test("unnecessary fields are removed", () => {
		const result = CREATE_INPUT_SCHEMA.parse({ ...VALID_INPUT, foo: "bar" });
		expect(result).toStrictEqual(VALID_INPUT);
	});

	test("fail to parse input with missing field", () => {
		const result = CREATE_INPUT_SCHEMA.safeParse({
			...VALID_INPUT,
			description: undefined,
		});
		expect(result.success).toBe(false);
	});
});

describe("CreateInput.toEntity", () => {
	test("expected fields are generated", () => {
		const dateBeforeCreate = new Date();
		const result = CreateInput.toEntity(VALID_INPUT);
		const dateAfterCreate = new Date();

		expect(result.id).toBeDefined();
		expect(result.createdAt.getTime()).toBe(result.updatedAt.getTime());
		expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(
			dateBeforeCreate.getTime(),
		);
		expect(result.createdAt.getTime()).toBeLessThanOrEqual(
			dateAfterCreate.getTime(),
		);
	});
});
