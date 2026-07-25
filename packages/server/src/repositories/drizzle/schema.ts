import {
	boolean,
	index,
	integer,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const configTable = pgTable("config", {
	// currently id is not required, but it is useful to implement upsert
	id: integer("id").generatedByDefaultAsIdentity().primaryKey(),

	timezone: varchar("timezone", { length: 255 }).notNull(),
});

export const eventTable = pgTable(
	"event",
	{
		id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
		type: varchar("type", { length: 255 }).notNull(),
		targetId: integer("target_id").notNull(),
		scheduledAt: timestamp("scheduled_at"),
		createdAt: timestamp("created_at").notNull(),
	},
	(table) => [index("type_index").on(table.type)],
);

export const workTable = pgTable("work", {
	id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
	title: varchar("title").notNull(),
	description: varchar("description").notNull(),
	public: boolean("public").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const workTagTable = pgTable(
	"work_tag",
	{
		id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
		workId: integer("work_id")
			.notNull()
			.references(() => workTable.id),
		name: varchar("name", { length: 255 }).notNull(),
	},
	(table) => [index("work_id_index").on(table.workId)],
);

export const workRevisionTable = pgTable("work_revision", {
	id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
	workId: integer("work_id"), // no foreign key constraint here. they both belong to different repositories.
	createdAt: timestamp("created_at").notNull(),
});
