// https://bun.com/docs/test/lifecycle#global-setup-and-teardown

import { afterAll, beforeAll } from "bun:test";

beforeAll(() => {
	// TODO: clean up db
});

afterAll(() => {
	// TODO: clean up db
});
