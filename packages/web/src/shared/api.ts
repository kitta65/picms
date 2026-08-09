import { hc } from "hono/client";
import type { PicmsApi } from "picms-server/api";
import { createContext } from "react";

const DEFAULT_API_CLIENT = hc<PicmsApi>(window.location.origin);
export type ApiClient = typeof DEFAULT_API_CLIENT;

export const ApiClientContext = createContext(DEFAULT_API_CLIENT);
