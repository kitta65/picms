import { describe, expect, spyOn, test } from "bun:test";
import { ERROR_CODE } from "../../constants";
import * as revisionService from "../revision/service";
import { _TEST as SHARED_REPOSITORY_TEST } from "../shared/repository";
import type { Revision } from "./entity";

const { FakeSharedStorage } = SHARED_REPOSITORY_TEST;
const revisionStorage = new FakeSharedStorage();

// 1x1 white PNG, re-encoded so `readById` returns a real JPEG.
const WHITE_PNG = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
	"base64",
);
const WHITE_JPEG = await new Bun.Image(WHITE_PNG).jpeg().toBuffer();
spyOn(revisionStorage, "readById").mockImplementation(() => WHITE_JPEG);

const VALID_REVISION: Revision = {
	id: Bun.randomUUIDv7(),
	workId: Bun.randomUUIDv7(),
	createdAt: new Date(),
};

describe("display", () => {
	describe("inside", () => {
		test("does not throw when width and height are specified", async () => {
			const options: revisionService.DisplayOptions = {
				resize: {
					mode: "inside",
					size: {
						width: 100,
						height: 100,
					},
				},
			};

			try {
				await revisionService.display(VALID_REVISION, options, {
					revisionStorage,
				});
			} catch {
				expect.unreachable();
			}
		});

		test("throw exception if width is not specified", async () => {
			const options: revisionService.DisplayOptions = {
				resize: {
					mode: "inside",
					size: {
						height: 100,
					},
				},
			};
			await expect(async () => {
				await revisionService.display(VALID_REVISION, options, {
					revisionStorage,
				});
			}).toThrow(ERROR_CODE.BAD_REQUEST);
		});

		test("throw exception if height is not specified", async () => {
			const options: revisionService.DisplayOptions = {
				resize: {
					mode: "inside",
					size: {
						width: 100,
					},
				},
			};
			await expect(async () => {
				await revisionService.display(VALID_REVISION, options, {
					revisionStorage,
				});
			}).toThrow(ERROR_CODE.BAD_REQUEST);
		});
	});
});
