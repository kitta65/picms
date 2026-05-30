import { assertStrictEquals } from "@std/assert";
import { API_ROUTE, BASE_URL } from "./index.ts";

Deno.test("`/api/foo` is routed to api", () => {
  const req = new Request(`${BASE_URL}/api/foo`);
  const match = API_ROUTE.test(req.url);

  assertStrictEquals(match, true);
});

Deno.test("`/api` is NOT routed to api (not intuitive but acceptable)", () => {
  const req = new Request(`${BASE_URL}/api`);
  const match = API_ROUTE.test(req.url);

  assertStrictEquals(match, false);
});
