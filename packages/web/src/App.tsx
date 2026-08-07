import "@/index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { Redirect, Route, Switch } from "wouter";

import { Breadcrumb } from "@/components/layouts/breadcrumb";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import { Home } from "@/components/routes/home";
import { Series } from "@/components/routes/series";
import { Settings } from "@/components/routes/settings";
import { Versions } from "@/components/routes/versions";
import { Works } from "@/components/routes/works";
import { WorksEdit } from "@/components/routes/works-edit";
import { WorksNew } from "@/components/routes/works-new";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isRoute, ROUTE, type Route as RouteType } from "@/lib/constants";

const queryClient = new QueryClient();

function Wrapper({ children }: { children: React.ReactNode }) {
	// add anything which should wrap entire app here!
	return (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<TooltipProvider>{children}</TooltipProvider>
			</QueryClientProvider>
		</StrictMode>
	);
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
			<div className="mx-6 my-2">
				<Header />
				<Separator className="my-2" />
				{/* TODO: Breadcrumb should be in the main tag? */}
				<Breadcrumb className="mb-2 mx-auto" />
				<main className="container mx-auto flex flex-col items-center justify-center">
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
				</main>
				<Separator className="my-2" />
				<Footer />
			</div>
		</Wrapper>
	);
}
