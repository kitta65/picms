import { describe, expect, spyOn, test } from "bun:test";
import { Hono, type InferResponseType } from "hono";
import { testClient } from "hono/testing";
import type { PicmsApi } from "picms-server/api";
import { _TEST as APP_TEST } from "@/app/App";
import { WorksNew } from "@/pages/works-new/ui";
import type { ApiClient } from "@/shared/api";
import { setupComponent } from "@/test-helpers";

const FAKE_API = new Hono()
	// mock implementation is required
	.use(async (c) => c.body(null, 501)) as unknown as PicmsApi;

const FAKE_API_CLIENT = testClient(FAKE_API);

type PostWorkReturn = InferResponseType<
	ApiClient["api"]["private"]["works"]["$post"]
>;
type PostRevisionReturn = InferResponseType<
	ApiClient["api"]["private"]["revisions"]["$post"]
>;
type GetSignedUrlReturn = InferResponseType<
	ApiClient["api"]["private"]["revisions"][":id"]["signed-url"]["$get"]
>;

const DUMMY_POST_WORK_RETURN: PostWorkReturn = {
	id: Bun.randomUUIDv7(),
	title: "dummy title",
	description: "dummy description",
	tags: ["foo", "bar"],
	createdAt: new Date().toJSON(),
	updatedAt: new Date().toJSON(),
	public: false,
};
const DUMMY_POST_REVISION_RETURN: PostRevisionReturn = {
	id: Bun.randomUUIDv7(),
	workId: DUMMY_POST_WORK_RETURN.id,
	createdAt: new Date().toJSON(),
};
const DUMMY_GET_SIGNED_URL_RETURN: GetSignedUrlReturn = `http://localhost:XXXX`; // invalid port (intentional)

const DUMMY_FILE = new File([], "dummy.jpeg", { type: "image/jpeg" });

function Wrapper({
	children,
	apiClient,
}: {
	children: React.ReactNode;
	apiClient?: ApiClient;
}) {
	return APP_TEST.Wrapper({
		children,
		options: {
			shouldRetry: false,
			apiClient: apiClient ?? FAKE_API_CLIENT,
		},
	});
}

describe("WorksNew", () => {
	test("cannot submit if required field is not set", async () => {
		const { component, user } = setupComponent(<WorksNew />);
		const button = component.getByRole("button", { name: /submit/i });
		await user.click(button);

		const alerts = component.getAllByRole("alert", { name: "" });
		expect(alerts.length).toBe(1); // title

		const fileInput = component.getByLabelText(/file/i);
		expect(fileInput).toBeInvalid();

		const titleInput = component.getByLabelText(/title/i);
		expect(titleInput).toBeInvalid();
	});

	test("can submit if required field is filled", async () => {
		using stack = new DisposableStack();
		let postWorkCounter = 0;
		let postRevisionCounter = 0;
		let getSignedUrlCounter = 0;
		const api = new Hono()
			.post("/api/private/works", (c) => {
				++postWorkCounter;
				return c.json(DUMMY_POST_WORK_RETURN);
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
		const client = testClient(api);
		const { component, user } = setupComponent(
			<Wrapper apiClient={client}>
				<WorksNew />
			</Wrapper>,
		);

		const fileInput = component.getByLabelText(/file/i);
		await user.upload(fileInput, DUMMY_FILE);

		const titleInput = component.getByLabelText(/title/i);
		await user.click(titleInput);
		await user.keyboard("this is title");

		const button = component.getByRole("button", { name: /submit/i });
		await user.click(button);

		await component.findByText(/saved/i); // sonner
		expect(postWorkCounter).toBe(1);
		expect(postRevisionCounter).toBe(1);
		expect(getSignedUrlCounter).toBe(1);
		expect(putFileSpy).toBeCalledTimes(1);
	});

	test("post revision request is not send if post work response is not OK", async () => {
		let postWorkCounter = 0;
		let postRevisionCounter = 0;
		const api = new Hono()
			.post("/api/private/works", (c) => {
				++postWorkCounter;
				return c.body(null, 500);
			})
			.post("/api/private/revisions", (c) => {
				++postRevisionCounter;
				return c.json(null, 500);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const client = testClient(api);
		const { component, user } = setupComponent(
			<Wrapper apiClient={client}>
				<WorksNew />
			</Wrapper>,
		);

		const fileInput = component.getByLabelText(/file/i);
		await user.upload(fileInput, DUMMY_FILE);

		const titleInput = component.getByLabelText(/title/i);
		await user.click(titleInput);
		await user.keyboard("this is title");

		const button = component.getByRole("button", { name: /submit/i });
		await user.click(button);

		await component.findByText(/something went wrong/i); // sonner
		expect(postWorkCounter).toBe(1);
		expect(postRevisionCounter).toBe(0);
	});

	test("get signed-url request is not send if post revision response is not OK", async () => {
		let postWorkCounter = 0;
		let postRevisionCounter = 0;
		let getSignedUrlCounter = 0;
		const api = new Hono()
			.post("/api/private/works", (c) => {
				++postWorkCounter;
				return c.json(DUMMY_POST_WORK_RETURN);
			})
			.post("/api/private/revisions", (c) => {
				++postRevisionCounter;
				return c.body(null, 500);
			})
			.get("/api/private/revisions/:id/signed-url", (c) => {
				++getSignedUrlCounter;
				return c.body(null, 500);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const client = testClient(api);
		const { component, user } = setupComponent(
			<Wrapper apiClient={client}>
				<WorksNew />
			</Wrapper>,
		);

		const fileInput = component.getByLabelText(/file/i);
		await user.upload(fileInput, DUMMY_FILE);

		const titleInput = component.getByLabelText(/title/i);
		await user.click(titleInput);
		await user.keyboard("this is title");

		const button = component.getByRole("button", { name: /submit/i });
		await user.click(button);

		await component.findByText(/something went wrong/i); // sonner
		expect(postWorkCounter).toBe(1);
		expect(postRevisionCounter).toBe(1);
		expect(getSignedUrlCounter).toBe(0);
	});

	test("put file request is not send if get signed-url response is not OK", async () => {
		using stack = new DisposableStack();
		let postWorkCounter = 0;
		let postRevisionCounter = 0;
		let getSignedUrlCounter = 0;
		const api = new Hono()
			.post("/api/private/works", (c) => {
				++postWorkCounter;
				return c.json(DUMMY_POST_WORK_RETURN);
			})
			.post("/api/private/revisions", (c) => {
				++postRevisionCounter;
				return c.json(DUMMY_POST_REVISION_RETURN);
			})
			.get("/api/private/revisions/:id/signed-url", (c) => {
				++getSignedUrlCounter;
				return c.body(null, 500);
			})
			.route("/*", FAKE_API) as PicmsApi;
		const putFileSpy = spyOn(global, "fetch").mockResolvedValue(
			new Response("ok"),
		);
		stack.defer(() => putFileSpy.mockReset()); // not reset automatically (bug?)
		const client = testClient(api);
		const { component, user } = setupComponent(
			<Wrapper apiClient={client}>
				<WorksNew />
			</Wrapper>,
		);

		const fileInput = component.getByLabelText(/file/i);
		await user.upload(fileInput, DUMMY_FILE);

		const titleInput = component.getByLabelText(/title/i);
		await user.click(titleInput);
		await user.keyboard("this is title");

		const button = component.getByRole("button", { name: /submit/i });
		await user.click(button);

		await component.findByText(/something went wrong/i); // sonner
		expect(postWorkCounter).toBe(1);
		expect(postRevisionCounter).toBe(1);
		expect(getSignedUrlCounter).toBe(1);
		expect(putFileSpy).toBeCalledTimes(0);
	});
});
