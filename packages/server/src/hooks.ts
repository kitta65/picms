// https://bun.com/docs/test/lifecycle#global-setup-and-teardown

import { afterAll, beforeAll } from "bun:test";

import * as DrizzleRepositories from "./infrastructures/drizzle/repositories";
import * as DrizzleTables from "./infrastructures/drizzle/tables";

const { DB } = DrizzleRepositories._TEST;

async function cleanUpDb() {
	// TODO: use more sophisticated method
	// https://github.com/drizzle-team/drizzle-orm/issues/5826
	await DB.delete(DrizzleTables.eventTable);
	await DB.delete(DrizzleTables.configTable);
	await DB.delete(DrizzleTables.workTagTable);
	await DB.delete(DrizzleTables.revisionTable);
	await DB.delete(DrizzleTables.workTable);
}

beforeAll(async () => {
	await cleanUpDb();
});

afterAll(async () => {
	await cleanUpDb();
});
