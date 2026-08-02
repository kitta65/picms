import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { SIGNED_URL_TTL_MINUTES } from "../../constants";
import type { ISharedStorage } from "../../domain/shared/repository";

type Sign = {
	path: string;
	token: string;
	signedAt: Date;
};

export class SharedStorage implements ISharedStorage {
	apiBaseUrl: string;
	directory: string = "";

	// NOTE:
	// currenty only one sign is rememberd.
	// it is enough for local environment.
	static sign: Sign = { path: "", token: "", signedAt: new Date(0) };

	constructor(apiBaseUrl: string) {
		this.apiBaseUrl = apiBaseUrl;
	}

	async getSignedUrl(fileName: string) {
		const token = crypto.randomBytes(36).toString("hex");
		const url = this.directory
			? `${this.apiBaseUrl}/${this.directory}/${fileName}?token=${token}`
			: `${this.apiBaseUrl}/${fileName}?token=${token}`;
		const path_ = path.join(this.directory, fileName);
		SharedStorage.sign = { path: path_, token, signedAt: new Date() };
		return url;
	}

	async checkAvailability(fileName: string) {
		const fullPath = this.#buildFullPath(fileName);
		const exists = await fs.exists(fullPath);
		return !exists;
	}

	async save(fileName: string, token: string, data: Blob) {
		// validate
		const currTs = Date.now();
		const signedTs = Number(SharedStorage.sign.signedAt);
		const elapsedMinutes = (currTs - signedTs) / 1000 / 60;
		const isValid =
			SharedStorage.sign.path === fileName &&
			SharedStorage.sign.token === token;
		elapsedMinutes < SIGNED_URL_TTL_MINUTES;
		if (!isValid) {
			throw new Error("Invalid token");
		}

		const fullPath = this.#buildFullPath(fileName);
		await fs.mkdir(path.dirname(fullPath), { recursive: true });
		await fs.writeFile(fullPath, data.stream());
	}

	async deleteByFileName(fileName: string) {
		const fullPath = this.#buildFullPath(fileName);
		await fs.rm(fullPath, { force: true });
	}

	#buildFullPath(fileName: string) {
		const { PICMS_CACHE_DIR } = Bun.env;
		let basePath = PICMS_CACHE_DIR;
		if (!basePath) {
			console.warn("PICMS_CACHE_DIR is not specified");
			basePath = "/tmp";
		}

		// "server" represents this package in monorepo
		const fullPath = path.resolve(basePath, "server", this.directory, fileName);
		return fullPath;
	}
}

export class RevisionStorage extends SharedStorage {
	constructor(apiBaseUrl: string) {
		super(apiBaseUrl);
		this.directory = "revision";
	}
}
