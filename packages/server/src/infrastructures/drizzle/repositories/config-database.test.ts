import { beforeEach, describe, expect, test } from "bun:test";
import { DB } from "../configs";
import { configTable } from "../tables";
import { configDatabase } from "./config-database";

describe("configDatabase", () => {
	beforeEach(async () => {
		await DB.delete(configTable);
	});

	describe("findFirst", () => {
		test("retuns undefined when empty", async () => {
			const result = await configDatabase.findFirst();
			expect(result).toBe(undefined);
		});

		test("return upserted value", async () => {
			const config = {
				timezone: "Asia/Tokyo",
			} as const;
			await configDatabase.upsert(config);
			const result = await configDatabase.findFirst();
			expect(result).toStrictEqual(config);
		});

		test("return last upserted value", async () => {
			const config1 = {
				timezone: "Asia/Tokyo",
			};
			await configDatabase.upsert(config1);

			const config2 = {
				timezone: "UTC",
			};
			await configDatabase.upsert(config2);
			const result = await configDatabase.findFirst();

			expect(result).toStrictEqual(config2);
		});
	});

	describe("upsert", () => {
		test("returns upserted value", async () => {
			const config = {
				timezone: "Asia/Tokyo",
			} as const;
			const result = await configDatabase.upsert(config);
			expect(result).toStrictEqual(config);
		});

		test("returns upserted value (null)", async () => {
			const config = {
				timezone: null,
			} as const;
			const result = await configDatabase.upsert(config);
			expect(result).toStrictEqual(config);
		});

		test("returns default value when invalid value is inserted", async () => {
			const config = {
				timezone: "Invalid/TimeZone",
			} as const;
			const result = await configDatabase.upsert(config);
			expect(result).toStrictEqual({ timezone: null });
		});
	});
});
