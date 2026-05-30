import { Hono } from "hono";

export const API_BASE_PATH = "/api";
export const API: Hono = new Hono();

API.get("/", (c) => {
  return c.text("hello from server");
});
