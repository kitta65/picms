export const PACKAGE = {
	MAIN: "picms-main",
	WEB: "picms-web",
} as const;

const PACKAGES = Object.values(PACKAGE);

export const PORT: { [k in (typeof PACKAGES)[number]]?: number } = {
	[PACKAGE.MAIN]: 5173,
	[PACKAGE.WEB]: 4000,
};
