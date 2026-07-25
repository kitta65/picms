import { Hono } from "hono";
import { validator } from "hono/validator";
import * as z from "zod";
import { STORAGE_API_BASE_PATH } from "../../constants";
import * as drizzleRepositories from "../../repositories/drizzle/repositories";
import * as localRepository from "../../repositories/local/repositories";

import { getRootUrl } from "../../utils";
export const REVISION_API = new Hono()
	// work-revisions
	.post("/", async (c) => {
		const repo = drizzleRepositories.workRevisionDatabase;
		const created = await repo.create();
		return c.json(created);
	})
	.get(
		"/:id/signed-url",
		validator("param", async (value, c) => {
			const { id } = value;
			const schema = z.coerce.number();
			const parsed = schema.safeParse(id);
			if (!parsed.success) {
				return c.text("Invalid", 401);
			}

			return parsed.data;
		}),
		async (c) => {
			const id = c.req.valid("param");
			const repo = drizzleRepositories.workRevisionDatabase;
			const revision = await repo.getById(id);

			// when revision is not found or revision is already associated with work
			if (!revision || revision.workId) {
				return c.text("Invalid", 401);
			}

			const apiBaseUrl = `${getRootUrl(c.req)}${STORAGE_API_BASE_PATH}`;
			const storage = new localRepository.SharedStorage(apiBaseUrl);
			const url = await storage.getSignedUrl(id.toString());
			return c.text(url);
		},
	);
