import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { HTTPException } from "hono/http-exception";
import { ERROR_CODE, SIGNED_URL_TTL_MINUTES } from "../../constants";
import type { ISharedStorage } from "../../domains/shared/repository";

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
			// since empty string may cause undefined behavior, it is not allowed
			const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
			throw new HTTPException(status, { message });
		}
		this.apiBaseUrl = apiBaseUrl;
		this.directory = directory;
		this.options = options ?? {};
	}

	async issueSignedUrl(id: string) {
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
			SharedStorage.sign.directory === this.directory &&
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

	async readById(id: string) {
		const fullPath = this.#buildFullPath(id);
		return fs.readFile(fullPath);
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
	constructor(apiBaseUrl: string, options?: Options) {
		super(apiBaseUrl, "revisions", options);
	}
}

export const _TEST = {
	BASE_PATH, // for cleanup
};
