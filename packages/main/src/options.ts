import { API_OPTIONS_SCHEMA } from "picms-server/options";
import * as z from "zod";

const PORT_OPTIONS_SCHEMA = z.object({
	// portWeb is not defined here, because it is not used in production
	portMain: z.string().pipe(z.transform((val) => Number(val))),
});

const PICMS_OPTIONS_SCHEMA = z.intersection(
	PORT_OPTIONS_SCHEMA,
	API_OPTIONS_SCHEMA,
);
type PicmsOptions = z.infer<typeof PICMS_OPTIONS_SCHEMA>;

export const PicmsOptions = {
	fromEnv(env: typeof Bun.env): PicmsOptions {
		const picmsEnv: Record<string, string> = {};
		for (const [k, v] of Object.entries(env)) {
			if (!k.startsWith("PICMS_") || typeof v !== "string") {
				continue;
			}

			const key = k.replace(/^PICMS_/, "");
			picmsEnv[key] = v;
		}
		return PICMS_OPTIONS_SCHEMA.parse(snakeToCamel(picmsEnv));
	},
	fromArgs(args: Record<string, string>): PicmsOptions {
		return PICMS_OPTIONS_SCHEMA.parse(kebabToCamel(args));
	},
};

function snakeToCamel(obj: Record<string, string>) {
	const result: Record<string, string> = {};
	for (const [keySnake, value] of Object.entries(obj)) {
		const key = keySnake
			.split("_")
			.map((k, i) => {
				const lower = k.toLowerCase();
				if (i === 0) {
					return lower;
				}

				let first = lower[0];
				if (!first) {
					return lower;
				}
				first = first.toUpperCase();

				return first + lower.slice(1);
			})
			.join("");
		result[key] = value;
	}
	return result;
}

function kebabToCamel(obj: Record<string, string>) {
	const result: Record<string, string> = {};
	for (const [keyKebab, value] of Object.entries(obj)) {
		const key = keyKebab
			.split("-")
			.map((k, i) => {
				const lower = k.toLowerCase();
				if (i === 0) {
					return lower;
				}

				let first = lower[0];
				if (!first) {
					return lower;
				}
				first = first.toUpperCase();

				return first + lower.slice(1);
			})
			.join("");
		result[key] = value;
	}
	return result;
}

export const forTesting = {
	snakeToCamel,
	kebabToCamel,
};
