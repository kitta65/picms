import * as z from "zod";

const _DEFAULT = {
	timezone: null,
} as const;

export const CONFIG_SCHEMA = z.object({
	// catch(null) handles future changes of supporetedValues
	timezone: z
		.enum(Intl.supportedValuesOf("timeZone"))
		.nullable()
		.catch(_DEFAULT.timezone),
});

export type Config = z.infer<typeof CONFIG_SCHEMA>;

// NOTE: ensure DEFAULT has valid properties by redeclaration
export const DEFAULT: Config = _DEFAULT;
