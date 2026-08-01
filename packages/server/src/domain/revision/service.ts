import type { ISharedStorage } from "../shared/repository";
import type { Revision } from "./entity";

export async function checkStorageAvailability(
	revision: Revision,
	di: { storage: ISharedStorage },
) {
	const storage = di.storage;
	const filename = revision.id;
	const isAvailable = storage.checkAvailability(filename);
	return isAvailable;
}
