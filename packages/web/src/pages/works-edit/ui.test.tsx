import { describe, expect, spyOn, test } from "bun:test";
import { Hono, type InferResponseType } from "hono";
import { testClient } from "hono/testing";
import type { PicmsApi } from "picms-server/api";
import type { Work } from "@/entities/work/model";
import { WorksEdit } from "@/pages/works-edit/ui";
import type { ApiClient } from "@/shared/api";
import { setupComponentAsync } from "@/test-helpers";

const FAKE_API = new Hono()
	// mock implementation is required
	.use(async (c) => c.body(null, 501)) as unknown as PicmsApi;

type GetWorkByIdReturn = InferResponseType<
	ApiClient["api"]["private"]["works"][":id"]["$get"]
>;
type PostWorkByIdReturn = InferResponseType<
	ApiClient["api"]["private"]["works"][":id"]["$post"]
>;
type PostRevisionReturn = InferResponseType<
	ApiClient["api"]["private"]["revisions"]["$post"]
>;
type GetSignedUrlReturn = InferResponseType<
	ApiClient["api"]["private"]["revisions"][":id"]["signed-url"]["$get"]
>;

const DUMMY_WORK: Work = {
	id: Bun.randomUUIDv7(),
	title: "foo",
	tags: ["foo", "bar"],
	description: "",
	public: false,
	revisionId: Bun.randomUUIDv7(),
	createdAt: new Date(),
	updatedAt: new Date(),
};
const DUMMY_GET_WORK_BY_ID_RETURN: GetWorkByIdReturn = {
	...DUMMY_WORK,
	createdAt: DUMMY_WORK.createdAt.toISOString(),
	updatedAt: DUMMY_WORK.updatedAt.toISOString(),
};
const DUMMY_POST_WORK_BY_ID_RETURN: PostWorkByIdReturn =
	DUMMY_GET_WORK_BY_ID_RETURN;
const DUMMY_POST_REVISION_RETURN: PostRevisionReturn = {
	id: Bun.randomUUIDv7(),
	workId: DUMMY_POST_WORK_BY_ID_RETURN.id,
	createdAt: new Date().toJSON(),
};
const DUMMY_GET_SIGNED_URL_RETURN: GetSignedUrlReturn = `http://localhost:XXXX`; // invalid port (intentional)
const DUMMY_FILE = new File([], "dummy.jpeg", { type: "image/jpeg" });

describe("WorksEdit", () => {
	test("cannot submit if required field is empty", async () => {
		// setup
		const api = new Hono()
			.get("/api/private/works/:id", (c) => {
				return c.json(DUMMY_GET_WORK_BY_ID_RETURN);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const apiClient = testClient(api);
		const { component, user } = await setupComponentAsync(
			<WorksEdit workId={DUMMY_WORK.id} />,
			{
				apiClient,
			},
		);
		await component.findByDisplayValue(DUMMY_WORK.title); // waiting for the data to be loaded

		// clear title
		const titleInput = component.getByLabelText(/title/i);
		await user.click(titleInput);
		await user.keyboard("{Backspace}".repeat(100));

		// try to submit
		const button = component.getByRole("button", { name: /submit/i });
		await user.click(button);

		// assertion
		expect(titleInput).toBeInvalid();
	});

	test("succeed to submit (without change)", async () => {
		// setup
		let postWorkByIdCounter = 0;
		const api = new Hono()
			.get("/api/private/works/:id", (c) => {
				return c.json(DUMMY_GET_WORK_BY_ID_RETURN);
			})
			.post("/api/private/works/:id", (c) => {
				++postWorkByIdCounter;
				return c.json(DUMMY_POST_WORK_BY_ID_RETURN);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const apiClient = testClient(api);
		const { component, user } = await setupComponentAsync(
			<WorksEdit workId={DUMMY_WORK.id} />,
			{
				apiClient,
			},
		);

		// submit
		await component.findByDisplayValue(DUMMY_WORK.title); // waiting for the data to be loaded
		const button = component.getByRole("button", { name: /submit/i });
		await user.click(button);

		await component.findByText(/saved/i); // sonner
		expect(postWorkByIdCounter).toBe(1);
	});

	test("succeed to submit (file is selected)", async () => {
		// setup
		using stack = new DisposableStack();
		let postWorkByIdCounter = 0;
		let postRevisionCounter = 0;
		let getSignedUrlCounter = 0;
		const api = new Hono()
			.get("/api/private/works/:id", (c) => {
				return c.json(DUMMY_GET_WORK_BY_ID_RETURN);
			})
			.post("/api/private/works/:id", (c) => {
				++postWorkByIdCounter;
				return c.json(DUMMY_POST_WORK_BY_ID_RETURN);
			})
			.post("/api/private/revisions", (c) => {
				++postRevisionCounter;
				return c.json(DUMMY_POST_REVISION_RETURN);
			})
			.get("/api/private/revisions/:id/signed-url", (c) => {
				++getSignedUrlCounter;
				return c.json(DUMMY_GET_SIGNED_URL_RETURN);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const putFileSpy = spyOn(global, "fetch").mockResolvedValue(
			new Response("ok"),
		);
		stack.defer(() => putFileSpy.mockReset()); // not reset automatically (bug?)
		const apiClient = testClient(api);
		const { component, user } = await setupComponentAsync(
			<WorksEdit workId={DUMMY_WORK.id} />,
			{
				apiClient,
			},
		);

		// select file
		const fileInput = component.getByLabelText(/file/i);
		await user.upload(fileInput, DUMMY_FILE);

		// submit
		await component.findByDisplayValue(DUMMY_WORK.title); // waiting for the data to be loaded
		const button = component.getByRole("button", { name: /submit/i });
		await user.click(button);

		await component.findByText(/saved/i); // sonner
		expect(postWorkByIdCounter).toBe(1);
		expect(postRevisionCounter).toBe(1);
		expect(getSignedUrlCounter).toBe(1);
		expect(putFileSpy).toBeCalledTimes(1);
	});
});
