import { PACKAGE, PORT } from "@picms/common/constants";
import { API, API_BASE_PATH } from "@picms/server";
import index from "@picms/web" with { type: "text" };

export const BASE_URL = `http://localhost:${PORT[PACKAGE.MAIN]}`;
export const API_ROUTE = new URLPattern(`${API_BASE_PATH}/*`, BASE_URL);

export async function handler(req: Request): Promise<Response> {
  if (API_ROUTE.test(req.url)) {
    return await API.fetch(req);
  }

  return new Response(index, {
    headers: { "content-type": "text/html" },
  });
}

if (import.meta.main) {
  Deno.serve({ port: PORT[PACKAGE.MAIN] }, handler);
}
