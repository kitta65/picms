import { defineConfig } from "drizzle-kit";

const { PG_USER, PG_PASS } = Bun.env;

export default defineConfig({
	out: "./drizzle",
	schema: "./src/repositories/drizzle/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		user: PG_USER,
		password: PG_PASS,
		host: "postgres",
		port: 5432,
		database: "picms",
	},
});
