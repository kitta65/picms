import * as z from "zod";

export const configInputSchema = z.object({
	timezone: z.enum(Intl.supportedValuesOf("timeZone")),
});

export type Config = z.infer<typeof configInputSchema>;
