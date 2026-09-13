import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import type { PicmsApi } from "picms-server/api";
import { _TEST } from "@/app/App";

const { Wrapper } = _TEST;
const FAKE_API = new Hono()
	// mock implementation is required
	.use(async (c) => c.body(null, 501)) as unknown as PicmsApi;

const FAKE_API_CLIENT = testClient(FAKE_API);

export function setupComponent(
	ui: Parameters<typeof Wrapper>[0]["children"],
	options: Parameters<typeof Wrapper>[0]["options"] = {},
) {
	// recommended to invoke before render
	// https://testing-library.com/docs/user-event/intro#writing-tests-with-userevent
	const user = userEvent.setup();

	const component = render(
		<Wrapper
			options={{
				isStrict: false,
				apiClient: FAKE_API_CLIENT,
				shouldRetry: false,
				showDevTools: false,
				...options,
			}}
		>
			{ui}
		</Wrapper>,
	);
	return { component, user };
}

export async function setupComponentAsync(
	...props: Parameters<typeof setupComponent>
) {
	let ret!: ReturnType<typeof setupComponent>;

	// see https://github.com/testing-library/react-testing-library/issues/1385
	await act(async () => {
		ret = setupComponent(...props);
	});

	return ret;
}
