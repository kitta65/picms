import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ERROR_CODE } from "./constants";
import { AppError, handleApiError, notImplemented } from "./errors";

const app = new Hono()
	.onError(handleApiError)
	.get("/http-exception", () => {
		const { status, message } = ERROR_CODE.BAD_REQUEST;
		throw new HTTPException(status, { message });
	})
	.get("/app-error", () => {
		throw new AppError("NOT_FOUND");
	})
	.get("/plain-error", () => {
		throw new Error("unexpected failure");
	});

describe("AppError", () => {
	test("carries a semantic code and the mapped message", () => {
		const error = new AppError("CONFLICT");
		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe("AppError");
		expect(error.code).toBe("CONFLICT");
		expect(error.message).toBe(ERROR_CODE.CONFLICT.message);
	});
});

describe("notImplemented", () => {
	test("throws a plain Error", () => {
		expect(() => notImplemented()).toThrow("Not Implemented");
		expect(() => notImplemented()).toThrow(Error);
	});
});

describe("handleApiError", () => {
	test("returns the HTTPException response as-is", async () => {
		const res = await app.request("/http-exception");
		expect(res.status).toBe(ERROR_CODE.BAD_REQUEST.status);
		expect(await res.text()).toBe(ERROR_CODE.BAD_REQUEST.message);
	});

	test("maps AppError to the matching HTTP status", async () => {
		const res = await app.request("/app-error");
		expect(res.status).toBe(ERROR_CODE.NOT_FOUND.status);
		expect(await res.text()).toBe(ERROR_CODE.NOT_FOUND.message);
	});

	test("maps unexpected errors to 500", async () => {
		const res = await app.request("/plain-error");
		expect(res.status).toBe(ERROR_CODE.INTERNAL_SERVER_ERROR.status);
		expect(await res.text()).toBe(ERROR_CODE.INTERNAL_SERVER_ERROR.message);
	});
});
