import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/repositories/drizzle/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		user: "picms",
		password: "pass",
		host: "postgres",
		port: 5432,
		database: "picms",
	},
});
