import { Hono } from "hono";
import { validator } from "hono/validator";

import { STORAGE_API_BASE_PATH } from "../constants";
import * as revisionIo from "../features/revision/io";
import * as revisionUsecase from "../features/revision/usecases";
import * as drizzleRepositories from "../infrastructures/drizzle/repositories";
import * as localRepository from "../infrastructures/local/repositories";
import { getRootUrl } from "../utils";

export const REVISION_API = new Hono()
	.post(
		"/",
		validator("json", async (value, c) => {
			const parsed = revisionIo.CREATE_INPUT_SCHEMA.safeParse(value);
			if (!parsed.success) {
				return c.text("Invalid", 400);
			}
			return parsed.data;
		}),
		async (c) => {
			const repository = drizzleRepositories.revisionDatabase;
			const entity = revisionIo.CreateInput.toEntity(c.req.valid("json"));
			const created = await repository.insert(entity);
			return c.json(created);
		},
	)
	.get(
		"/:id",
		validator("param", async (value, c) => {
			const parsed = revisionIo.FIND_BY_ID_INPUT_SCHEMA.safeParse(value);
			if (!parsed.success) {
				return c.text("Invalid", 401);
			}

			return parsed.data;
		}),
		async (c) => {
			const param = c.req.valid("param");
			const repo = drizzleRepositories.revisionDatabase;
			const revision = await repo.findById(param.id);
			if (!revision) {
				return c.body(null, 404);
			}
			return c.json(revision);
		},
	)
	.get(
		"/:id/signed-url",
		validator("param", async (value, c) => {
			const parsed = revisionIo.ISSUE_SIGNED_URL_INPUT_SCHEMA.safeParse(value);
			if (!parsed.success) {
				return c.text("Invalid", 401);
			}

			return parsed.data;
		}),
		async (c) => {
			const param = c.req.valid("param");
			const db = drizzleRepositories.revisionDatabase;
			const apiBaseUrl = `${getRootUrl(c.req)}${STORAGE_API_BASE_PATH}`;
			const storage = new localRepository.RevisionStorage(apiBaseUrl);
			const url = await revisionUsecase.issueSignedUrl(param.id, {
				db,
				storage,
			});
			return c.text(url);
		},
	);
