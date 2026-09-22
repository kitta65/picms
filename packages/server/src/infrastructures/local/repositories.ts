import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { SIGNED_URL_TTL_MINUTES } from "../../constants";
import type { ISharedStorage } from "../../domains/shared/repository";
import { CodedError } from "../../errors";

type Sign = {
	directory: string;
	resourceId: string;
	token: string;
	signedAt: Date;
};

type Options = {
	skipValidation?: boolean;
};

const { PICMS_CACHE_DIR } = Bun.env;
const CACHE_DIR = PICMS_CACHE_DIR ? PICMS_CACHE_DIR : "/tmp";
const BASE_PATH = path.resolve(
	CACHE_DIR,
	"server", // "server" represents this package in monorepo
);

export class SharedStorage implements ISharedStorage {
	apiBaseUrl: string;
	directory: string;
	options: Options;

	// NOTE:
	// currenty only one sign is rememberd.
	// it is enough for local environment.
	static sign: Sign = {
		directory: "",
		resourceId: "",
		token: "",
		signedAt: new Date(0),
	};

	constructor(apiBaseUrl: string, directory: string, options?: Options) {
		if (!directory) {
			throw new Error(
				"since empty string may cause undefined behavior, it is not allowed",
			);
		}
		this.apiBaseUrl = apiBaseUrl;
		this.directory = directory;
		this.options = options ?? {};
	}

	async issueSignedUrl(id: Parameters<ISharedStorage["issueSignedUrl"]>[0]) {
		const token = crypto.randomBytes(36).toString("hex");
		const url = `${this.apiBaseUrl}/${this.directory}/${id}?token=${token}`;
		SharedStorage.sign = {
			directory: this.directory,
			resourceId: id,
			token,
			signedAt: new Date(),
		};
		return url;
	}

	async checkAvailability(
		id: Parameters<ISharedStorage["checkAvailability"]>[0],
	) {
		const fullPath = this.#buildFullPath(id);
		const exists = await fs.exists(fullPath);
		return !exists;
	}

	async save(id: string, token: string, data: Blob) {
		// validate
		const currTs = Date.now();
		const signedTs = Number(SharedStorage.sign.signedAt);
		const elapsedMinutes = (currTs - signedTs) / 1000 / 60;
		const isValid =
			SharedStorage.sign.directory === this.directory &&
			SharedStorage.sign.resourceId === id &&
			SharedStorage.sign.token === token &&
			elapsedMinutes < SIGNED_URL_TTL_MINUTES;
		if (!isValid && !this.options.skipValidation) {
			throw new CodedError("UNAUTHORIZED");
		}

		const fullPath = this.#buildFullPath(id);
		await fs.mkdir(path.dirname(fullPath), { recursive: true });
		// do not overwrite
		// https://nodejs.org/api/fs.html#file-system-flags
		await fs.writeFile(fullPath, data.stream(), { flag: "wx" });
	}

	async readById(id: Parameters<ISharedStorage["readById"]>[0]) {
		const fullPath = this.#buildFullPath(id);
		const file = Bun.file(fullPath);
		return { stream: file.stream(), size: file.size };
	}

	async deleteById(id: Parameters<ISharedStorage["deleteById"]>[0]) {
		const fullPath = this.#buildFullPath(id);
		await fs.rm(fullPath, { force: true });
	}

	#buildFullPath(id: string) {
		const fullPath = path.resolve(BASE_PATH, this.directory, id);
		return fullPath;
	}
}

export class RevisionStorage extends SharedStorage {
	constructor(apiBaseUrl: string, options?: Options) {
		super(apiBaseUrl, "revisions", options);
	}
}

export const forTesting = {
	BASE_PATH, // for cleanup
};
