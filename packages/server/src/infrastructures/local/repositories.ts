import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { HTTPException } from "hono/http-exception";
import { ERROR_CODE, SIGNED_URL_TTL_MINUTES } from "../../constants";
import type { ISharedStorage } from "../../domains/shared/repository";

type Sign = {
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

abstract class SharedStorage implements ISharedStorage {
	apiBaseUrl: string;
	abstract directory: string; // empty string may cause undefined behavior
	options: Options;

	// NOTE:
	// currenty only one sign is rememberd.
	// it is enough for local environment.
	static sign: Sign = { resourceId: "", token: "", signedAt: new Date(0) };

	constructor(apiBaseUrl: string, options?: Options) {
		this.apiBaseUrl = apiBaseUrl;
		this.options = options ?? {};
	}

	async issueSignedUrl(id: string) {
		const token = crypto.randomBytes(36).toString("hex");
		const url = `${this.apiBaseUrl}/${this.directory}/${id}?token=${token}`;
		SharedStorage.sign = { resourceId: id, token, signedAt: new Date() };
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
			SharedStorage.sign.resourceId === id &&
			SharedStorage.sign.token === token &&
			elapsedMinutes < SIGNED_URL_TTL_MINUTES;
		if (!isValid && !this.options.skipValidation) {
			const { status, message } = ERROR_CODE.UNAUTHORIZED;
			throw new HTTPException(status, { message });
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
		const fullPath = path.resolve(BASE_PATH, this.directory, id);
		return fullPath;
	}
}

export class RevisionStorage extends SharedStorage {
	directory = "revision";
}

export const _TEST = {
	BASE_PATH, // for cleanup
	SharedStorage,
};
