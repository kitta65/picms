import { describe, expect, test } from "bun:test";
import type { Revision } from "../../domains/revision/entity";
import {
	CREATE_INPUT_SCHEMA,
	CreateInput,
	FIND_BY_ID_INPUT_SCHEMA,
	ISSUE_SIGNED_URL_INPUT_SCHEMA,
} from "./io";

const VALID_CREATE_INPUT = {
	workId: Bun.randomUUIDv7(),
} satisfies Partial<Revision>;

describe("CREATE_INPUT_SCHEMA", () => {
	test("succeed to parse valid input", () => {
		const result = CREATE_INPUT_SCHEMA.parse(VALID_CREATE_INPUT);
		expect(result).toStrictEqual(VALID_CREATE_INPUT);
	});

	test("fail to parse input with missing fields", () => {
		const input = {};
		const result = CREATE_INPUT_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});

	test("fail to parse input with invalid uuid", () => {
		const input = {
			...VALID_CREATE_INPUT,
			workId: "foo/bar",
		} satisfies Partial<Revision>;
		const result = CREATE_INPUT_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});
});

describe("CreateInput.toEntity", () => {
	test("expected fields are generated", () => {
		const dateBeforeCreate = new Date();
		const result = CreateInput.toEntity(VALID_CREATE_INPUT);
		const dateAfterCreate = new Date();

		expect(result.id).toBeDefined();
		expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(
			dateBeforeCreate.getTime(),
		);
		expect(result.createdAt.getTime()).toBeLessThanOrEqual(
			dateAfterCreate.getTime(),
		);
	});
});

const VALID_FIND_BY_ID_INPUT = {
	id: Bun.randomUUIDv7(),
} satisfies Partial<Revision>;

describe("FIND_BY_ID_INPUT_SCHEMA", () => {
	test("succeed to parse valid input", () => {
		const result = FIND_BY_ID_INPUT_SCHEMA.parse(VALID_FIND_BY_ID_INPUT);
		expect(result).toStrictEqual(VALID_FIND_BY_ID_INPUT);
		//
	});
});

const VALID_ISSUE_SIGNED_URL_INPUT = {
	id: Bun.randomUUIDv7(),
} satisfies Partial<Revision>;

describe("ISSUE_SIGNED_URL_INPUT_SCHEMA", () => {
	test("succeed to parse valid input", () => {
		const result = ISSUE_SIGNED_URL_INPUT_SCHEMA.parse(
			VALID_ISSUE_SIGNED_URL_INPUT,
		);
		expect(result).toStrictEqual(VALID_ISSUE_SIGNED_URL_INPUT);
		//
	});
});
