import { describe, expect, test } from "bun:test";
import { ORPHAN_REVISION_TTL_MINUTES } from "../../constants";
import { REVISION_SCHEMA, Revision } from "./entity";

const VALID_UUID_V7 = "019fbc3a-44c6-7000-8617-c2fbfbf7729d";
const VALID_DATE = new Date(2026, 0, 1, 0, 0, 0); // 2026-01-01 00:00:00

describe("REVISION_SCHEMA", () => {
	test("succeed to parse valid data", () => {
		const input = {
			id: VALID_UUID_V7,
			workId: VALID_UUID_V7,
			createdAt: VALID_DATE,
		};
		const result = REVISION_SCHEMA.safeParse(input);
		expect(result.success).toBe(true);
	});

	test("fail to parse data with missing fields", () => {
		const inputs = [
			{
				workId: VALID_UUID_V7,
				createdAt: VALID_DATE,
			},
			{
				id: VALID_UUID_V7,
				createdAt: VALID_DATE,
			},
			{
				id: VALID_UUID_V7,
				workId: VALID_UUID_V7,
			},
		];
		const results = inputs.map((i) => REVISION_SCHEMA.safeParse(i));
		for (const r of results) {
			expect(r.success).toBe(false);
		}
	});

	test("fail to parse data with uuid v4", () => {
		const input = {
			id: "de123c19-cc8b-4c53-8f25-2f7d19be0971",
			workId: VALID_UUID_V7,
			createdAt: VALID_DATE,
		};
		const result = REVISION_SCHEMA.safeParse(input);
		expect(result.success).toBe(false);
	});
});

describe("isWithinOrphanTtl", () => {
	test("true if current ts is smaller then createdAt", () => {
		const revision: Revision = {
			id: VALID_UUID_V7,
			workId: VALID_UUID_V7,
			// this is the maximum timestamp https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date
			createdAt: new Date(8.64e15),
		};
		const result = Revision.isWithinOrphanTtl(revision);
		expect(result).toBe(true);
	});

	test("false if current ts is larger than cratedAt", () => {
		const revision: Revision = {
			id: VALID_UUID_V7,
			workId: VALID_UUID_V7,
			createdAt: new Date(0),
		};
		const result = Revision.isWithinOrphanTtl(revision);
		expect(result).toBe(false);
	});

	test("true if the diff is just the same value as ORPHAN_REVISION_TTL_MINUTES", () => {
		const revision: Revision = {
			id: VALID_UUID_V7,
			workId: VALID_UUID_V7,
			createdAt: new Date(2026, 0, 1, 0, 0, 0),
		};
		const result = Revision.isWithinOrphanTtl(
			revision,
			new Date(2026, 0, 1, 0, ORPHAN_REVISION_TTL_MINUTES, 0),
		);
		expect(result).toBe(true);
	});
});
