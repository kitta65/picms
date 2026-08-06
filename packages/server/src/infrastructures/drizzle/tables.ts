import {
	boolean,
	index,
	integer,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const configTable = pgTable("config", {
	// currently id is not required, but it is useful to implement upsert
	id: uuid("id").notNull().primaryKey(),

	timezone: varchar("timezone", { length: 255 }),
});

export const messageTable = pgTable(
	"message",
	{
		id: uuid("id").notNull().primaryKey(),
		type: varchar("type", { length: 255 }).notNull(),
		targetId: uuid("target_id").notNull(),
		attemptCount: integer("attempt_count").notNull(),
		scheduledAt: timestamp("scheduled_at").notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	(table) => [
		index("scheduled_at__idx").on(table.scheduledAt),
		index("attempt_count__scheduled_at__idx").on(
			table.attemptCount,
			table.scheduledAt,
		),
	],
);

export const workTable = pgTable("work", {
	id: uuid("id").notNull().primaryKey(),
	title: varchar("title").notNull(),
	description: varchar("description").notNull(),
	public: boolean("public").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const workTagTable = pgTable(
	"work_tag",
	{
		id: uuid("id").notNull().primaryKey(),
		workId: uuid("work_id")
			.notNull()
			.references(() => workTable.id),
		name: varchar("name", { length: 255 }).notNull(),
	},
	(table) => [index("work_id__idx").on(table.workId)],
);

export const revisionTable = pgTable("work_revision", {
	id: uuid("id").notNull().primaryKey(),
	workId: uuid("work_id").notNull(), // no foreign key constraint here. they both belong to different repositories.
	createdAt: timestamp("created_at").notNull(),
});
