import { Hono } from "hono";
import { validator } from "hono/validator";
import type { Di } from "../di";
import * as revisionService from "../domains/revision/service";
import { CodedError } from "../errors";
import * as revisionIo from "../features/revision/io";
import * as revisionUsecase from "../features/revision/usecases";

export function createRevisionApi(di: Di) {
	return new Hono()
		.post(
			"/",
			validator("json", async (value) => {
				const parsed = revisionIo.CREATE_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}
				return parsed.data;
			}),
			async (c) => {
				const repository = di.revisionDatabase;
				const entity = revisionIo.CreateInput.toEntity(c.req.valid("json"));
				const { data: created } = await repository.insert(entity);
				return c.json(created, 201);
			},
		)
		.get(
			"/:id",
			validator("param", async (value) => {
				const parsed = revisionIo.FIND_BY_ID_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}

				return parsed.data;
			}),
			async (c) => {
				const param = c.req.valid("param");
				const repo = di.revisionDatabase;
				const revision = await repo.findById(param.id);
				if (!revision) {
					throw new CodedError("NOT_FOUND");
				}
				return c.json(revision);
			},
		)
		.get(
			"/:id/signed-url",
			validator("param", async (value) => {
				const parsed =
					revisionIo.ISSUE_SIGNED_URL_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}

				return parsed.data;
			}),
			async (c) => {
				const param = c.req.valid("param");
				const url = await revisionUsecase.issueSignedUrl(param.id, di);
				return c.text(url);
			},
		)
		.get(
			"/:id/download",
			validator("param", async (value) => {
				const parsed = revisionIo.DOWNLOAD_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}

				return parsed.data;
			}),
			async (c) => {
				const param = c.req.valid("param");
				return revisionUsecase.download(param.id, di);
			},
		)
		.get(
			"/:revisionId/:mode/:size",
			validator("param", async (value) => {
				const parsed = revisionIo.DISPLAY_INPUT_SCHEMA.safeParse(value);
				if (!parsed.success) {
					throw new CodedError("BAD_REQUEST");
				}

				return parsed.data;
			}),
			async (c) => {
				const param = c.req.valid("param");

				const revision = await di.revisionDatabase.findById(param.revisionId);
				if (!revision) {
					throw new CodedError("NOT_FOUND");
				}
				const options = revisionIo.DisplayInput.toDisplayOptions(param);
				const blob = await revisionService.display(revision, options, di);
				return new Response(blob);
			},
		);
}
