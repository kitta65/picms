import { describe, expect, test } from "bun:test";
import { EVENT_SCHEMA, Event } from "./entity";

const VALID_UUID_V7 = "019fbc3a-44c6-7000-8617-c2fbfbf7729d";
const VALID_DATE = new Date(2026, 0, 1, 0, 0, 0); // 2026-01-01 00:00:00
const VALID_INPUT = {
	id: VALID_UUID_V7,
	type: "REVISION_INSERTED",
	targetId: VALID_UUID_V7,
	attemptCount: 0,
	scheduledAt: VALID_DATE,
	createdAt: VALID_DATE,
} as const;

describe("EVENT_SCHEMA", () => {
	test("succeed to parse valid data", () => {
		const input: Event = VALID_INPUT;
		const result = EVENT_SCHEMA.safeParse(input);
		expect(result.success).toBe(true);
	});

	test("fail to parse data with missing fields", () => {
		const input = {
			...VALID_INPUT,
			id: null,
		};
		const result = EVENT_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});

	test("failed to parse data with invalid type", () => {
		const input = {
			...VALID_INPUT,
			type: "UNKNOWN_TYPE",
		};
		const result = EVENT_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});
});

describe("create", () => {
	test("minimum input", () => {
		const tsBeforeCreate = new Date();
		const input = {
			type: "REVISION_INSERTED",
			targetId: VALID_UUID_V7,
		} as const satisfies Partial<Event>;
		const created = Event.create(input);
		const tsAfterCreate = new Date();

		// createdAt is current timestamp
		expect(Number(created.createdAt)).toBeGreaterThanOrEqual(
			Number(tsBeforeCreate),
		);
		expect(Number(created.createdAt)).toBeLessThanOrEqual(
			Number(tsAfterCreate),
		);

		// createdAt is the same value as scheduledAt
		expect(created.createdAt).toBe(created.scheduledAt);
	});

	test("minimum input + scheduledAt", () => {
		const scheduledAt = VALID_DATE;
		const input = {
			type: "REVISION_INSERTED",
			targetId: VALID_UUID_V7,
			scheduledAt,
		} as const satisfies Partial<Event>;
		const created = Event.create(input);

		expect(created.scheduledAt).toBe(VALID_DATE);
	});
});
