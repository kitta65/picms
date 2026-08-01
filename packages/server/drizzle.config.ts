import { defineConfig } from "drizzle-kit";

const { PG_USER, PG_PASS, PG_PORT } = Bun.env;

export default defineConfig({
	out: "./drizzle",
	schema: "./src/infrastructures/drizzle/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		user: PG_USER,
		password: PG_PASS,
		host: "postgres",
		port: Number(PG_PORT),
		database: "picms",
	},
});
