import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { ISharedStorage } from "../../domain/shared/repository";

type Sign = {
	filename: string;
	token: string;
};

export class SharedStorage implements ISharedStorage {
	apiBaseUrl: string;
	directory: string = "";

	// NOTE:
	// currenty only one sign is rememberd.
	// it is enough for local environment.
	static sign: Sign = { filename: "", token: "" };

	constructor(apiBaseUrl: string) {
		this.apiBaseUrl = apiBaseUrl;
	}

	async getSignedUrl(filename: string) {
		const token = crypto.randomBytes(36).toString("hex");
		const url = this.directory
			? `${this.apiBaseUrl}/${this.directory}/${filename}?token=${token}`
			: `${this.apiBaseUrl}/${filename}?token=${token}`;
		SharedStorage.sign = { filename, token };
		return url;
	}

	async checkAvailability(fileName: string) {
		const fullPath = this.#buildFullPath(fileName);
		const exists = await fs.exists(fullPath);
		return exists;
	}

	async save(fileName: string, token: string, data: Blob) {
		// validate
		const isValid =
			SharedStorage.sign.filename === fileName &&
			SharedStorage.sign.token === token;
		if (!isValid) {
			throw new Error("Invalid token");
		}

		const fullPath = this.#buildFullPath(fileName);
		await fs.mkdir(path.dirname(fullPath), { recursive: true });
		await fs.writeFile(fullPath, data.stream());
	}

	#buildFullPath(fileName: string) {
		const { PICMS_CACHE_DIR } = Bun.env;
		let basePath = PICMS_CACHE_DIR;
		if (!basePath) {
			console.warn("PICMS_CACHE_DIR is not specified");
			basePath = "/tmp";
		}

		// "server" represents this package in monorepo
		basePath = path.resolve(basePath, "server", this.directory);
		const fullPath = path.resolve(basePath, fileName);
		return fullPath;
	}
}

export class RevisionStorage extends SharedStorage {
	constructor(apiBaseUrl: string) {
		super(apiBaseUrl);
		this.directory = "revision/";
	}
}
