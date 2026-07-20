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
	// NOTE:
	// currenty only one sign is rememberd.
	// it is enough for local environment.
	static sign: Sign = { filename: "", token: "" };

	constructor(apiBaseUrl: string) {
		this.apiBaseUrl = apiBaseUrl;
	}

	async getSignedUrl(filename: string) {
		const token = crypto.randomBytes(36).toString("hex");
		const url = `${this.apiBaseUrl}/${filename}?token=${token}`;
		SharedStorage.sign = { filename, token };
		return url;
	}

	async save(filename: string, token: string, data: Blob) {
		// validate
		const isValid =
			SharedStorage.sign.filename === filename &&
			SharedStorage.sign.token === token;
		if (!isValid) {
			throw new Error("Invalid token");
		}

		const { PICMS_CACHE_DIR } = Bun.env;
		let basepath = PICMS_CACHE_DIR;
		if (!basepath) {
			console.warn("PICMS_CACHE_DIR is not specified");
			basepath = "/tmp";
		}

		// "server" represents this package
		basepath = path.resolve(basepath, "server");
		const fullpath = path.resolve(basepath, filename);
		await fs.mkdir(path.dirname(fullpath), { recursive: true });
		await fs.writeFile(fullpath, data.stream());

		return fullpath;
	}
}
