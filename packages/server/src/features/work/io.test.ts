import { describe, expect, test } from "bun:test";
import type { Work } from "../../domains/work/entity";
import {
	CREATE_INPUT_SCHEMA,
	CreateInput,
	UPDATE_INPUT_SCHEMA,
	UpdateInput,
} from "./io";

const VALID_CREATE_INPUT = {
	title: "foobar",
	tags: ["foo", "bar"],
	description: "",
	public: true,
} satisfies Partial<Work>;

describe("CREATE_INPUT_SCHEMA", () => {
	test("succeed to parse valid input", () => {
		const result = CREATE_INPUT_SCHEMA.parse(VALID_CREATE_INPUT);
		expect(result).toStrictEqual(VALID_CREATE_INPUT);
	});

	test("unnecessary fields are removed", () => {
		const result = CREATE_INPUT_SCHEMA.parse({
			...VALID_CREATE_INPUT,
			foo: "bar",
		});
		expect(result).toStrictEqual(VALID_CREATE_INPUT);
	});

	test("fail to parse input with missing field", () => {
		const result = CREATE_INPUT_SCHEMA.safeParse({
			...VALID_CREATE_INPUT,
			description: undefined,
		});
		expect(result.success).toBe(false);
	});
});

describe("CreateInput.toEntity", () => {
	test("expected fields are generated", () => {
		const dateBeforeCreate = new Date();
		const result = CreateInput.toEntity(VALID_CREATE_INPUT);
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

const VALID_UPDATE_INPUT_FULL = {
	id: Bun.randomUUIDv7(),
	title: "foobar",
	tags: ["foo", "bar"],
	description: "",
	public: true,
} satisfies Required<UpdateInput>;
const VALID_UPDATE_INPUT_MINIMUM = {
	id: Bun.randomUUIDv7(),
} satisfies UpdateInput;

describe("UPDATE_INPUT_SCHEMA", () => {
	test("succeed to parse valid input (full)", () => {
		const result = UPDATE_INPUT_SCHEMA.safeParse(VALID_UPDATE_INPUT_FULL);
		expect(result.success).toBe(true);
	});

	test("succeed to parse valid input (minimal)", () => {
		const result = UPDATE_INPUT_SCHEMA.safeParse(VALID_UPDATE_INPUT_MINIMUM);
		expect(result.success).toBe(true);
	});

	test("fail to parse input if id is invalid", () => {
		const result = UPDATE_INPUT_SCHEMA.safeParse({ id: "foobar" });
		expect(result.success).toBe(false);
	});
});

describe("UpdateInput.forRepository", () => {
	test("expected fields are generated", () => {
		const dateBefore = new Date();
		const result = UpdateInput.forRepository(VALID_UPDATE_INPUT_FULL);
		const dateAfter = new Date();

		expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
			dateBefore.getTime(),
		);
		expect(result.updatedAt.getTime()).toBeLessThanOrEqual(dateAfter.getTime());
	});
});
