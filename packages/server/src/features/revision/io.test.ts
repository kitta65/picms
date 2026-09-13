import { describe, expect, test } from "bun:test";
import type { Revision } from "../../domains/revision/entity";
import {
	CREATE_INPUT_SCHEMA,
	CreateInput,
	DISPLAY_INPUT_SCHEMA,
	DisplayInput,
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

const VALID_DISPLAY_INPUT = {
	revisionId: Bun.randomUUIDv7(),
	size: "100x100",
	mode: "inside",
} satisfies DisplayInput;

describe("DISPLAY_INPUT_SCHEMA", () => {
	test("succeed to parse valid input", () => {
		const result = DISPLAY_INPUT_SCHEMA.safeParse(VALID_DISPLAY_INPUT);
		expect(result.success).toBe(true);
	});

	test("fail to parse invalid input (invalid size)", () => {
		const result = DISPLAY_INPUT_SCHEMA.safeParse({
			...VALID_DISPLAY_INPUT,
			size: "100:100",
		} satisfies DisplayInput);
		expect(result.success).toBe(false);
	});

	test("succeed to parse valid input (invalid mode)", () => {
		const result = DISPLAY_INPUT_SCHEMA.safeParse({
			...VALID_DISPLAY_INPUT,
			// biome-ignore lint: intentional any
			mode: "InvalidMode" as any,
		} satisfies DisplayInput);
		expect(result.success).toBe(false);
	});
});

describe("DisplayInput.toDisplayOptions", () => {
	test("width and height are preserved", () => {
		const input: DisplayInput = {
			...VALID_DISPLAY_INPUT,
			size: "200x400",
		};
		const result = DisplayInput.toDisplayOptions(input);
		expect(result.resize.size.width).toBe(200);
		expect(result.resize.size.height).toBe(400);
	});

	test("unspecified width and height are handled as undefined", () => {
		const input: DisplayInput = {
			...VALID_DISPLAY_INPUT,
			size: "x",
		};
		const result = DisplayInput.toDisplayOptions(input);
		expect(result.resize.size.width).toBeUndefined();
		expect(result.resize.size.height).toBeUndefined();
	});
});
