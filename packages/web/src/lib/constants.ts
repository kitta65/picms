const ROUTES = [
	"HOME",
	"WORKS",
	"WORKS_WITH_ID",
	"VERSIONS",
	"SERIES",
	"SETTINGS",
] as const;

export type Route = (typeof ROUTES)[number];

export function isRoute(route: string): route is Route {
	return ROUTES.some((r) => r === route);
}

// NOTE: the order matters
export const ROUTE: {
	[k in Route]: { label: string; pattern: string };
} = {
	HOME: { label: "Home", pattern: "/" },
	VERSIONS: { label: "Versions", pattern: "/works/:id/versions" },
	WORKS_WITH_ID: { label: "", pattern: "/works/:id" },
	WORKS: { label: "Works", pattern: "/works" },
	SERIES: { label: "Series", pattern: "/series" },
	SETTINGS: { label: "Settings", pattern: "/settings" },
} as const;
