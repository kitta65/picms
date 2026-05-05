import { Hono } from "hono";
import { PACKAGE, ROUTE } from "picms-common/constants";

export const app = new Hono();

app.get(ROUTE[PACKAGE.SERVER], (c) => {
	return c.text("hello from server");
});
