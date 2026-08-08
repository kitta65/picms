import React from "react";
import { Link, useLocation } from "wouter";
import { ROUTE } from "@/app/routes";
import {
	Breadcrumb as Breadcrumb_,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/ui/shadcn/breadcrumb";

const BASE_URL = window.location.origin;

export function Breadcrumb({ className }: React.ComponentProps<"nav">) {
	let [location] = useLocation();
	if (location.endsWith("/")) {
		// trailing slash does not matter in this application
		location = location.slice(0, -1);
	}
	const items = location.split("/");

	// root page does not need breadcrumb
	if (items.length === 1) {
		return;
	}

	return (
		<Breadcrumb_ className={className}>
			<BreadcrumbList>
				{items.map((item, idx) => {
					let to: string;
					if (idx === 0) {
						to = "/";
					} else {
						to = items.slice(0, idx + 1).join("/");
					}

					const label =
						Object.values(ROUTE).find((route) => {
							if (!route.label) return false; // maybe it's a dynamic link

							const pattern = new URLPattern(route.pattern, BASE_URL);
							return pattern.test(to, BASE_URL);
						})?.label ?? item;

					return (
						<React.Fragment key={to}>
							{idx !== 0 && <BreadcrumbSeparator />}
							<BreadcrumbItem>
								{idx + 1 === items.length ? (
									<BreadcrumbPage>{label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link to={to}>{label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb_>
	);
}

export function TestComponent() {
	return <span data-testid="my-first-test">foo</span>;
}
