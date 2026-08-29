import { drizzle } from "drizzle-orm/bun-sql";
import { RELATIONS } from "./relations";

const { PG_PASS, PG_USER, PG_PORT } = Bun.env;

export const DB = drizzle({
	connection: {
		hostname: "postgres",
		password: PG_PASS,
		username: PG_USER,
		port: PG_PORT,
	},
	relations: RELATIONS,
});
