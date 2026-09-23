import * as z from "zod";

const STORAGE_OPTIONS_LOCAL_SCHEMA = z.object({
	storageType: z.literal("local"),
	storageLocalOrigin: z.string().min(1),
});

const STORAGE_OPTIONS_GCS_SCHEMA = z.object({
	storageType: z.literal("gcs"),
	storageGcsBucket: z.string().min(1),
});

const STORAGE_OPTIONS_SCHEMA = z.discriminatedUnion("storageType", [
	STORAGE_OPTIONS_LOCAL_SCHEMA,
	STORAGE_OPTIONS_GCS_SCHEMA,
]);

// when you add other options, use z.intersection(STORAGE_OPTIONS_SCHEMA, ...);
export const API_OPTIONS_SCHEMA = STORAGE_OPTIONS_SCHEMA;
export type ApiOptions = z.infer<typeof API_OPTIONS_SCHEMA>;
