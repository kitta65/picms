const ROUTES = [
	"HOME",
	"WORKS",
	"WORKS_WITH_ID",
	"WORKS_NEW",
	"WORKS_EDIT",
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
	// TODO: since it is also used as concrete path, pattern should be renamed.
	[k in Route]: { label: string; pattern: string };
} = {
	// NOTE:
	// currently label is used by header and breadcrumb.
	// I have to prepare dedicated labels for each purpose maybe someday.
	HOME: { label: "Home", pattern: "/" },
	VERSIONS: { label: "Versions", pattern: "/works/:id/versions" },
	WORKS_NEW: { label: "New", pattern: "/works/new" },
	WORKS_EDIT: { label: "", pattern: "/works/:id/edit" },
	WORKS_WITH_ID: { label: "", pattern: "/works/:id" },
	WORKS: { label: "Works", pattern: "/works" },
	SERIES: { label: "Series", pattern: "/series" },
	SETTINGS: { label: "Settings", pattern: "/settings" },
} as const;
