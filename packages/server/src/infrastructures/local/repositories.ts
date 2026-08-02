import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { SIGNED_URL_TTL_MINUTES } from "../../constants";
import type { ISharedStorage } from "../../domains/shared/repository";

type Sign = {
	path: string;
	token: string;
	signedAt: Date;
};

type Options = {
	skipValidation?: boolean;
};

class SharedStorage implements ISharedStorage {
	apiBaseUrl: string;
	directory: string = "";
	options: Options;

	// NOTE:
	// currenty only one sign is rememberd.
	// it is enough for local environment.
	static sign: Sign = { path: "", token: "", signedAt: new Date(0) };

	constructor(apiBaseUrl: string, options?: Options) {
		this.apiBaseUrl = apiBaseUrl;
		this.options = options ?? {};
	}

	async issueSignedUrl(id: string) {
		const token = crypto.randomBytes(36).toString("hex");
		const url = this.directory
			? `${this.apiBaseUrl}/${this.directory}/${id}?token=${token}`
			: `${this.apiBaseUrl}/${id}?token=${token}`;
		const path_ = path.join(this.directory, id);
		SharedStorage.sign = { path: path_, token, signedAt: new Date() };
		return url;
	}

	async checkAvailability(id: string) {
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
			SharedStorage.sign.path === path.join(this.directory, id) &&
			SharedStorage.sign.token === token &&
			elapsedMinutes < SIGNED_URL_TTL_MINUTES;
		if (!isValid && !this.options.skipValidation) {
			throw new Error("Invalid token");
		}

		const fullPath = this.#buildFullPath(id);
		await fs.mkdir(path.dirname(fullPath), { recursive: true });
		await fs.writeFile(fullPath, data.stream());
	}

	async deleteById(id: string) {
		const fullPath = this.#buildFullPath(id);
		await fs.rm(fullPath, { force: true });
	}

	#buildFullPath(id: string) {
		const { PICMS_CACHE_DIR } = Bun.env;
		let basePath = PICMS_CACHE_DIR;
		if (!basePath) {
			console.warn("PICMS_CACHE_DIR is not specified");
			basePath = "/tmp";
		}

		// "server" represents this package in monorepo
		const fullPath = path.resolve(basePath, "server", this.directory, id);
		return fullPath;
	}
}

export class RevisionStorage extends SharedStorage {
	constructor(apiBaseUrl: string) {
		super(apiBaseUrl);
		this.directory = "revision";
	}
}

export const _TEST = {
	SharedStorage,
};
