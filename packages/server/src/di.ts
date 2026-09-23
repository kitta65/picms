import { SERVER_ROUTE } from "picms-shared/constants";
import { STORAGE_API_PATH } from "./constants";
import type { IConfigDatabase } from "./domains/config/repository";
import type { IMessageBroker } from "./domains/message/repository";
import type { IRevisionDatabase } from "./domains/revision/repository";
import type { ISharedStorage } from "./domains/shared/repository";
import type { IWorkDatabase } from "./domains/work/repository";
import type { IWorkView } from "./features/work/view";
import { configDatabase } from "./infrastructures/drizzle/repositories/config-database";
import { messageBroker } from "./infrastructures/drizzle/repositories/message-broker";
import { revisionDatabase } from "./infrastructures/drizzle/repositories/revision-database";
import { workDatabase } from "./infrastructures/drizzle/repositories/work-database";
import { workView } from "./infrastructures/drizzle/views";
import * as gcsRepositories from "./infrastructures/gcs/repositories";
import * as localRpositories from "./infrastructures/local/repositories";
import type { ApiOptions } from "./options";

export type Di = {
	// work
	workDatabase: IWorkDatabase;
	workView: IWorkView;
	// revision
	revisionDatabase: IRevisionDatabase;
	revisionStorage: ISharedStorage;
	// config
	configDatabase: IConfigDatabase;
	// message
	messageBroker: IMessageBroker;
};

export const Di = {
	fromOptions(options: ApiOptions): Di {
		const revisionStorage =
			options.storageType === "local"
				? new localRpositories.RevisionStorage(
						options.storageLocalOrigin + SERVER_ROUTE + STORAGE_API_PATH,
					)
				: gcsRepositories.revisionStorage;
		return {
			workDatabase,
			workView,
			revisionDatabase,
			revisionStorage,
			configDatabase,
			messageBroker,
		};
	},
};
