import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export function setupComponent(...props: Parameters<typeof render>) {
	// recommended to invoke before render
	// https://testing-library.com/docs/user-event/intro#writing-tests-with-userevent
	const user = userEvent.setup();

	const component = render(...props);
	return { component, user };
}

export async function setupComponentAsync(...props: Parameters<typeof render>) {
	let ret!: ReturnType<typeof setupComponent>;

	// see https://github.com/testing-library/react-testing-library/issues/1385
	await act(async () => {
		ret = setupComponent(...props);
	});

	return ret;
}
