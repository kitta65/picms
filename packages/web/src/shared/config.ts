const ROUTES = [
	"HOME",
	"WORKS",
	"WORKS_WITH_ID",
	"WORKS_NEW",
	"WORKS_EDIT",
	"REVISIONS",
	"SERIES",
	"SETTINGS",
] as const;

type Route = (typeof ROUTES)[number];

// NOTE: the order matters
export const ROUTE = {
	// NOTE:
	// currently label is used by header and breadcrumb.
	// I have to prepare dedicated labels for each purpose maybe someday.
	HOME: { label: "Home", pattern: "/", getLink: () => "/" },
	REVISIONS: {
		label: "Versions",
		pattern: "/works/:id/versions",
		getLink: ({ workId }) => `/works/${workId}/versions`,
	},
	WORKS_EDIT: {
		label: "Edit",
		pattern: "/works/:id/edit",
		getLink: ({ workId }) => `/works/${workId}/edit`,
	},
	WORKS_NEW: {
		label: "New",
		pattern: "/works/new",
		getLink: () => "/works/new",
	},
	WORKS_WITH_ID: {
		label: "",
		pattern: "/works/:id",
		getLink: ({ workId }) => `/works/${workId}`,
	},
	WORKS: { label: "Works", pattern: "/works", getLink: () => "/works" },
	SERIES: { label: "Series", pattern: "/series", getLink: () => "/series" },
	SETTINGS: {
		label: "Settings",
		pattern: "/settings",
		getLink: () => "/settings",
	},
} as const satisfies {
	[k in Route]: {
		label: string;
		pattern: string;
		getLink?: (params: { [k: string]: string }) => string;
	};
};

type RouteKey = keyof typeof ROUTE;
export type RoutePattern = (typeof ROUTE)[RouteKey]["pattern"];
