export const PACKAGE = {
	MAIN: "picms-main",
	SERVER: "picms-server",
	WEB: "picms-web",
} as const;

const PACKAGES = Object.values(PACKAGE);

export const PORT = {
	[PACKAGE.MAIN]: 5173,
	[PACKAGE.WEB]: 4000,
} as const satisfies { [k in (typeof PACKAGES)[number]]?: number };
