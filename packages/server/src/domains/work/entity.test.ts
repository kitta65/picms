import { describe, expect, test } from "bun:test";
import { WORK_SCHEMA, type Work } from "./entity";

const VALID_INPUT = {
	id: Bun.randomUUIDv7(),
	title: "foo",
	tags: [],
	description: "",
	public: false,
	createdAt: new Date(),
	updatedAt: new Date(),
} satisfies Work;

describe("WORK_SCHEMA", () => {
	test("succeed to parse valid data", () => {
		const result = WORK_SCHEMA.safeParse(VALID_INPUT);
		expect(result.success).toBe(true);
	});

	test("fail to parse input with empty title", () => {
		const input = {
			...VALID_INPUT,
			title: "",
		} satisfies Work;
		const result = WORK_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});

	test("fail to parse input with empty tag", () => {
		const input = {
			...VALID_INPUT,
			tags: [""],
		} satisfies Work;
		const result = WORK_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});
});
