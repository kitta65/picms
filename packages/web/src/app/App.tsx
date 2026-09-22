import "@/app/styles/index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { assertNever } from "picms-shared/types";
import { lazy, StrictMode, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import { Breadcrumb } from "@/app/layouts/breadcrumb";
import { Footer } from "@/app/layouts/footer";
import { Header } from "@/app/layouts/header";
import { Home } from "@/pages/home";
import { Revisions } from "@/pages/revisions";
import { Series } from "@/pages/series";
import { Settings } from "@/pages/settings";
import { Works } from "@/pages/works/ui";
import { WorksEdit } from "@/pages/works-edit/ui";
import { WorksNew } from "@/pages/works-new/ui";
import {
	type ApiClient,
	ApiClientContext,
	DEFAULT_API_CLIENT,
} from "@/shared/api";
import { ROUTE, type RoutePattern } from "@/shared/routes";
import { Separator } from "@/shared/ui/shadcn/separator";
import { Toaster } from "@/shared/ui/shadcn/sonner";
import { TooltipProvider } from "@/shared/ui/shadcn/tooltip";

const CLIENT = new QueryClient();

// https://tanstack.com/devtools/latest/docs/production#excluding-devtools-from-production-on-non-vite-projects
const DevTools =
	process.env.NODE_ENV !== "production"
		? lazy(() => import("@/app/dev-tools"))
		: () => null;

type WrapperProps = {
	children: React.ReactNode;
	options?: {
		isStrict?: boolean;
		apiClient?: ApiClient;
		showDevTools?: boolean;
	};
};
// add anything which should wrap entire app here!
function Wrapper({ children, options }: WrapperProps) {
	// Prefer production-safe defaults, with as many features enabled as possible.
	const defaultOptions: Required<WrapperProps["options"]> = {
		isStrict: true,
		apiClient: DEFAULT_API_CLIENT,
		showDevTools: true,
	};

	let component = children;

	component = (
		<>
			{component}
			<Toaster position="bottom-center" />
		</>
	);

	component = (
		<QueryClientProvider client={CLIENT}>{component}</QueryClientProvider>
	);

	const apiClient = options?.apiClient ?? defaultOptions.apiClient;
	component = (
		<ApiClientContext value={apiClient}>{component}</ApiClientContext>
	);

	const showDevTools = options?.showDevTools ?? defaultOptions.showDevTools;
	if (showDevTools) {
		component = (
			<>
				{component}
				<Suspense fallback={null}>
					<DevTools />
				</Suspense>
			</>
		);
	}

	component = <TooltipProvider>{component}</TooltipProvider>;

	const isStrict = options?.isStrict ?? defaultOptions.isStrict;
	if (isStrict) {
		component = <StrictMode>{component}</StrictMode>;
	}

	return component;
}

function renderByPattern(pattern: RoutePattern) {
	switch (pattern) {
		case ROUTE.HOME.pattern:
			return <Route path={pattern} component={Home} />;
		case ROUTE.WORKS.pattern:
			return <Route path={pattern} component={Works} />;
		case ROUTE.WORKS_WITH_ID.pattern:
			return <Route path={pattern} component={Works} />;
		case ROUTE.WORKS_EDIT.pattern:
			return (
				<Route path={pattern}>
					{(params) => <WorksEdit workId={params.id} />}
				</Route>
			);
		case ROUTE.WORKS_NEW.pattern:
			return <Route path={pattern} component={WorksNew} />;
		case ROUTE.REVISIONS.pattern:
			return (
				<Route path={pattern}>
					{(params) => <Revisions workId={params.id} />}
				</Route>
			);
		case ROUTE.SERIES.pattern:
			return <Route path={pattern} component={Series} />;
		case ROUTE.SETTINGS.pattern:
			return <Route path={pattern} component={Settings} />;
		default:
			assertNever(pattern);
	}
}

export function App() {
	return (
		<Wrapper>
			<div className="px-6 py-4">
				<Header />
				<Separator className="my-4" />
				<main className="">
					<Breadcrumb className="mb-4" />
					<div className="container mx-auto flex flex-col items-center justify-center">
						<Switch>
							{Object.values(ROUTE).map((route) =>
								renderByPattern(route.pattern),
							)}

							{/* fallback */}
							<Redirect to="/" />
						</Switch>
					</div>
				</main>
				<Separator className="my-4" />
				<Footer />
			</div>
		</Wrapper>
	);
}

export const forTesting = {
	Wrapper,
};
