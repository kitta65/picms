import React from "react";
import { Link, useLocation } from "wouter";
import {
	Breadcrumb as Breadcrumb_,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/lib/constants";

const BASE_URL = window.location.origin;

export function Breadcrumb({ className }: React.ComponentProps<"nav">) {
	const [location] = useLocation();
	const items = location.split("/");

	if (
		// can't be
		items.length < 2 ||
		// root
		items[1] === ""
	) {
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
