import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

import { ERROR_CODE, STORAGE_API_BASE_PATH } from "../constants";
import * as revisionIo from "../features/revision/io";
import * as revisionUsecase from "../features/revision/usecases";
import * as drizzleRepositories from "../infrastructures/drizzle/repositories";
import * as localRepository from "../infrastructures/local/repositories";
import { getRootUrl } from "../utils";

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
			const apiBaseUrl = `${getRootUrl(c.req.raw)}${STORAGE_API_BASE_PATH}`;
			const revisionStorage = new localRepository.RevisionStorage(apiBaseUrl);
			const url = await revisionUsecase.issueSignedUrl(param.id, {
				revisionDatabase,
				revisionStorage,
			});
			return c.text(url);
		},
	);
