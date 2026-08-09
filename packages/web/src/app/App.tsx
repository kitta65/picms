import "@/app/styles/index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
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
import { WorksNew } from "@/pages/works-new";
import { type ApiClient, ApiClientContext } from "@/shared/api";
import { Separator } from "@/shared/ui/shadcn/separator";
import { TooltipProvider } from "@/shared/ui/shadcn/tooltip";

const queryClient = new QueryClient();
const queryClientNoRetry = new QueryClient({
	defaultOptions: { queries: { retry: false } },
});

type WrapperProps = {
	children: React.ReactNode;
	options?: {
		isStrict?: boolean;
		apiClient?: ApiClient;
		shouldRetry?: boolean;
	};
};
// add anything which should wrap entire app here!
function Wrapper({ children, options }: WrapperProps) {
	let component = children;

	const isStrict = options?.isStrict ?? true;
	if (isStrict) {
		component = <StrictMode>{component}</StrictMode>;
	}

	const shouldRetry = options?.shouldRetry ?? true;
	component = (
		<QueryClientProvider
			client={shouldRetry ? queryClient : queryClientNoRetry}
		>
			{component}
		</QueryClientProvider>
	);

	const apiClient = options?.apiClient;
	if (apiClient) {
		component = (
			<ApiClientContext value={apiClient}>{component}</ApiClientContext>
		);
	}

	component = <TooltipProvider>{component}</TooltipProvider>;

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
		<Wrapper>
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
