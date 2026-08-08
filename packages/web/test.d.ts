import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { DetachedWindowAPI } from "happy-dom";

// https://bun.com/docs/guides/test/testing-library
declare module "bun:test" {
	interface Matchers<T>
		extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
	interface AsymmetricMatchers extends TestingLibraryMatchers {}
}

declare global {
	interface Window {
		// https://github.com/capricorn86/happy-dom/wiki/DetachedWindowAPI
		happyDOM: DetachedWindowAPI;
	}
}
