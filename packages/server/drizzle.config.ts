import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/repositories/drizzle/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		// biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature is specified in tsconfig.json
		user: Bun.env["PG_USER"],
		// biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature is specified in tsconfig.json
		password: Bun.env["PG_PASS"],
		host: "postgres",
		port: 5432,
		database: "picms",
	},
});
