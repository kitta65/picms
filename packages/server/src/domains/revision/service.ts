import { buffer } from "node:stream/consumers";
import { HTTPException } from "hono/http-exception";
import { ERROR_CODE } from "../../constants";
import type { ISharedStorage } from "../shared/repository";
import type { Revision } from "./entity";

export async function checkStorageAvailability(
	revision: Revision,
	di: { revisionStorage: ISharedStorage },
) {
	const storage = di.revisionStorage;
	const revisionId = revision.id;
	const isAvailable = storage.checkAvailability(revisionId);
	return isAvailable;
}

export const DISPLAY_MODES = ["inside"] as const;

export type DisplayOptions = {
	resize: {
		mode: (typeof DISPLAY_MODES)[number];
		size: {
			width?: number;
			height?: number;
		};
	};
};

// NOTE:
// Currently resize is the most straightforward name,
// but display is more appropriate while we also want to cover other types of assets (e.g. 3D models) later.
export async function display(
	revision: Revision,
	options: DisplayOptions,
	di: { revisionStorage: ISharedStorage },
) {
	const storage = di.revisionStorage;
	const { stream } = await storage.readById(revision.id);
	const buff = await buffer(stream);
	const image = new Bun.Image(buff);
	const { width, height } = options.resize.size;
	const mode = options.resize.mode;
	switch (mode) {
		case "inside":
			if (!width || !height) {
				const { status, message } = ERROR_CODE.BAD_REQUEST;
				throw new HTTPException(status, { message });
			}
			// TODO: test returned blob type (perhaps, I have to specify explicitly)
			return await image.resize(width, height, { fit: "inside" }).blob();
		default: {
			const { status, message } = ERROR_CODE.NOT_IMPLEMENTED;
			throw new HTTPException(status, { message });
		}
	}
}

const FILE_TYPES = ["jpg"] as const; // intended to be used as file extension
export type FileType = (typeof FILE_TYPES)[number];
type Metadata = {
	fileType: FileType;
	fileSize: number; // size in bytes
};
export async function readWithMetadata(
	revision: Revision,
	di: { revisionStorage: ISharedStorage },
) {
	const storage = di.revisionStorage;
	const { stream, size } = await storage.readById(revision.id);
	const metadata: Metadata = {
		fileType: "jpg", // TODO: detect fileType from data
		fileSize: size,
	};

	return { stream, metadata };
}
