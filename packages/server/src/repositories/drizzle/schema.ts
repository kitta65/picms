import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const configTable = pgTable("config", {
	// currently id is not required, but it is useful to implement upsert
	id: integer("id").generatedByDefaultAsIdentity().primaryKey(),

	timezone: varchar("timezone", { length: 255 }).notNull(),
});
