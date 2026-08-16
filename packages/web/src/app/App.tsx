import "@/app/styles/index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, StrictMode, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";

import { Breadcrumb } from "@/app/layouts/breadcrumb";
import { Footer } from "@/app/layouts/footer";
import { Header } from "@/app/layouts/header";
import { isRoute, ROUTE, type Route as RouteType } from "@/app/routes";
import { Home } from "@/pages/home";
import { Series } from "@/pages/series";
import { Settings } from "@/pages/settings";
import { Versions } from "@/pages/versions";
import { Works } from "@/pages/works";
import { WorksEdit } from "@/pages/works-edit";
import { WorksNew } from "@/pages/works-new/ui";
import { type ApiClient, ApiClientContext } from "@/shared/api";
import { Separator } from "@/shared/ui/shadcn/separator";
import { Toaster } from "@/shared/ui/shadcn/sonner";
import { TooltipProvider } from "@/shared/ui/shadcn/tooltip";

const CLIENT = new QueryClient();
const CLIENT_NO_RETRY = new QueryClient({
	defaultOptions: { queries: { retry: false } },
});

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
		shouldRetry?: boolean;
		showDevTools?: boolean;
	};
};
// add anything which should wrap entire app here!
function Wrapper({ children, options }: WrapperProps) {
	let component = children;

	component = (
		<>
			{component}
			<Toaster position="bottom-center" />
		</>
	);

	const shouldRetry = options?.shouldRetry ?? true;
	component = (
		<QueryClientProvider client={shouldRetry ? CLIENT : CLIENT_NO_RETRY}>
			{component}
		</QueryClientProvider>
	);

	const apiClient = options?.apiClient;
	if (apiClient) {
		component = (
			<ApiClientContext value={apiClient}>{component}</ApiClientContext>
		);
	}

	const showDevTools = options?.showDevTools ?? false;
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

	const isStrict = options?.isStrict ?? true;
	if (isStrict) {
		component = <StrictMode>{component}</StrictMode>;
	}

	return component;
}

const ROUTE_TO_COMPONENT: { [k in RouteType]: React.ComponentType } = {
	HOME: Home,
	WORKS: Works,
	WORKS_WITH_ID: Works,
	WORKS_NEW: WorksNew,
	WORKS_EDIT: WorksEdit,
	VERSIONS: Versions,
	SERIES: Series,
	SETTINGS: Settings,
};

export function App() {
	return (
		<Wrapper options={{ isStrict: true, showDevTools: true }}>
			<div className="mx-6 my-4">
				<Header />
				<Separator className="my-4" />
				<main className="">
					<Breadcrumb className="mb-4" />
					<div className="container mx-auto flex flex-col items-center justify-center">
						<Switch>
							{Object.entries(ROUTE).map(([k, v]) => {
								if (!isRoute(k)) return null; // can't be!
								return (
									<Route
										path={v.pattern}
										key={v.pattern}
										component={ROUTE_TO_COMPONENT[k]}
									/>
								);
							})}

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

export const _TEST = {
	Wrapper,
};
