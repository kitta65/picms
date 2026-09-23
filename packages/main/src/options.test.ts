import { describe, expect, test } from "bun:test";
import { forTesting, PicmsOptions } from "./options";

const { kebabToCamel, snakeToCamel } = forTesting;

describe("snakeToCamel", () => {
	test("upper snake", () => {
		const input = {
			ENV_FOO: "foo",
			ENV_BAR: "bar",
		};
		const output = snakeToCamel(input);

		expect(output).toStrictEqual({
			envFoo: "foo",
			envBar: "bar",
		});
	});
	test("lower snake (not expected, but I believe it works)", () => {
		const input = {
			env_foo: "foo",
			env_bar: "bar",
		};
		const output = snakeToCamel(input);

		expect(output).toStrictEqual({
			envFoo: "foo",
			envBar: "bar",
		});
	});
});

describe("kebabToCamel", () => {
	test("lower kebab", () => {
		const input = {
			"env-foo": "foo",
			"env-bar": "bar",
		};
		const output = kebabToCamel(input);

		expect(output).toStrictEqual({
			envFoo: "foo",
			envBar: "bar",
		});
	});
	test("upper kebab (not expected, but I believe it works)", () => {
		const input = {
			"ENV-FOO": "foo",
			"ENV-BAR": "bar",
		};
		const output = kebabToCamel(input);
		expect(output).toStrictEqual({
			envFoo: "foo",
			envBar: "bar",
		});
	});
});

const VALID_PICMS_ENV = {
	PICMS_PORT_MAIN: "3000",
	PICMS_STORAGE_TYPE: "local",
	PICMS_STORAGE_LOCAL_ORIGIN: "http://localhost:3000",
} as const;

describe("PicmsOptions.fromEnv", () => {
	test("succeed to parse valid input", () => {
		const input = VALID_PICMS_ENV;
		const output = PicmsOptions.fromEnv(input);
		expect(output).toStrictEqual({
			portMain: 3000,
			storageType: "local",
			storageLocalOrigin: "http://localhost:3000",
		});
	});

	test("fail to parse invalid input (invalid storage type)", () => {
		const input = {
			...VALID_PICMS_ENV,
			PICMS_STORAGE_TYPE: "invalid type",
		} satisfies Record<keyof typeof VALID_PICMS_ENV, string>;
		expect(() => {
			PicmsOptions.fromEnv(input);
		}).toThrow();
	});

	test("fail to parse invalid input (missing required field)", () => {
		const input = {
			...VALID_PICMS_ENV,
			PICMS_STORAGE_LOCAL_ORIGIN: undefined,
		} satisfies Partial<typeof VALID_PICMS_ENV>;
		expect(() => {
			PicmsOptions.fromEnv(input);
		}).toThrow();
	});
});
