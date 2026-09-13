import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext } = createFormHookContexts();
export const { useAppForm, withFieldGroup } = createFormHook({
	fieldComponents: {},
	formComponents: {},
	fieldContext,
	formContext,
});
