import { type ClientResponse, hc } from "hono/client";
import type { PicmsApi } from "picms-server/api";
import { createContext } from "react";

const DEFAULT_API_CLIENT = hc<PicmsApi>(window.location.origin);
export type ApiClient = typeof DEFAULT_API_CLIENT;

export const ApiClientContext = createContext(DEFAULT_API_CLIENT);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types
export class ApiError extends Error {
	res: ClientResponse<unknown>;

	constructor(response: ClientResponse<unknown>) {
		super(`API Error: ${response.status}`);
		this.name = "ApiError";
		this.res = response;
	}
}
