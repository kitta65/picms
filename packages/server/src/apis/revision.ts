import { Hono } from "hono";
import { validator } from "hono/validator";

import { STORAGE_API_BASE_PATH } from "../constants";
import * as revisionIo from "../features/revision/io";
import * as drizzleRepositories from "../repositories/drizzle/repositories";
import * as localRepository from "../repositories/local/repositories";
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
			const entity = revisionIo.toEntity(c.req.valid("json"));
			const created = await repository.create(entity);
			return c.json(created);
		},
	)
	.get(
		"/:id/signed-url",
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
			const revision = await repo.getById(param.id);

			// when revision is not found or revision is already associated with work
			if (!revision || revision.workId) {
				return c.text("Invalid", 401);
			}

			const apiBaseUrl = `${getRootUrl(c.req)}${STORAGE_API_BASE_PATH}`;
			const storage = new localRepository.SharedStorage(apiBaseUrl);
			const url = await storage.getSignedUrl(param.id);
			return c.text(url);
		},
	);
