import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

import { ERROR_CODE, PRIVATE_API_PATH, STORAGE_API_PATH } from "../constants";
import * as revisionService from "../domains/revision/service";
import * as revisionIo from "../features/revision/io";
import * as revisionUsecase from "../features/revision/usecases";
import * as drizzleRepositories from "../infrastructures/drizzle/repositories";
import * as localRepository from "../infrastructures/local/repositories";

export const REVISION_API = new Hono()
	.post(
		"/",
		validator("json", async (value) => {
			const parsed = revisionIo.CREATE_INPUT_SCHEMA.safeParse(value);
			if (!parsed.success) {
				const { status, message } = ERROR_CODE.BAD_REQUEST;
				throw new HTTPException(status, { message });
			}
			return parsed.data;
		}),
		async (c) => {
			const repository = drizzleRepositories.revisionDatabase;
			const entity = revisionIo.CreateInput.toEntity(c.req.valid("json"));
			const { data: created } = await repository.insert(entity);
			return c.json(created);
		},
	)
	.get(
		"/:id",
		validator("param", async (value) => {
			const parsed = revisionIo.FIND_BY_ID_INPUT_SCHEMA.safeParse(value);
			if (!parsed.success) {
				const { status, message } = ERROR_CODE.BAD_REQUEST;
				throw new HTTPException(status, { message });
			}

			return parsed.data;
		}),
		async (c) => {
			const param = c.req.valid("param");
			const repo = drizzleRepositories.revisionDatabase;
			const revision = await repo.findById(param.id);
			if (!revision) {
				const { status, message } = ERROR_CODE.NOT_FOUND;
				throw new HTTPException(status, { message });
			}
			return c.json(revision);
		},
	)
	.get(
		"/:id/signed-url",
		validator("param", async (value) => {
			const parsed = revisionIo.ISSUE_SIGNED_URL_INPUT_SCHEMA.safeParse(value);
			if (!parsed.success) {
				const { status, message } = ERROR_CODE.BAD_REQUEST;
				throw new HTTPException(status, { message });
			}

			return parsed.data;
		}),
		async (c) => {
			const param = c.req.valid("param");
			const revisionDatabase = drizzleRepositories.revisionDatabase;
			const splitted = c.req.url.split(PRIVATE_API_PATH);
			const basePath = splitted.at(0);
			if (splitted.length !== 2 || !basePath) {
				const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
				throw new HTTPException(status, { message });
			}
			const revisionStorage = new localRepository.RevisionStorage(
				basePath + STORAGE_API_PATH,
			);
			const url = await revisionUsecase.issueSignedUrl(param.id, {
				revisionDatabase,
				revisionStorage,
			});
			return c.text(url);
		},
	)
	.get(
		"/:id/:mode/:size",
		validator("param", async (value) => {
			const parsed = revisionIo.DISPLAY_INPUT_SCHEMA.safeParse(value);
			if (!parsed.success) {
				const { status, message } = ERROR_CODE.BAD_REQUEST;
				throw new HTTPException(status, { message });
			}

			return parsed.data;
		}),
		async (c) => {
			const param = c.req.valid("param");
			const revisionDatabase = drizzleRepositories.revisionDatabase;
			const splitted = c.req.url.split(PRIVATE_API_PATH);
			const basePath = splitted.at(0);
			if (splitted.length !== 2 || !basePath) {
				const { status, message } = ERROR_CODE.INTERNAL_SERVER_ERROR;
				throw new HTTPException(status, { message });
			}
			const revisionStorage = new localRepository.RevisionStorage(
				basePath + STORAGE_API_PATH,
			);

			const revision = await revisionDatabase.findById(param.id);
			if (!revision) {
				const { status, message } = ERROR_CODE.NOT_FOUND;
				throw new HTTPException(status, { message });
			}
			const options = revisionIo.DisplayInput.toDisplayOptions(param);
			const blob = await revisionService.display(revision, options, {
				revisionStorage,
			});
			return new Response(blob);
		},
	);
