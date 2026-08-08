// https://bun.com/docs/guides/test/testing-library
import { afterEach, beforeAll, expect } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);

const BASE_URL = "http://localhost";

beforeAll(() => {
	window.happyDOM.setURL(BASE_URL);
});

// Optional: cleans up `render` after each test
afterEach(() => {
	cleanup();
});
