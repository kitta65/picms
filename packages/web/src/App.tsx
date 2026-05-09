import { BookOpen } from "lucide-react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import "./index.css";

import { columns, type Payment } from "./components/columns";
import { DataTable } from "./components/data-table";
import logo from "./logo.svg";

export function App() {
	return (
		<TooltipProvider>
			<div className="mx-6 my-2">
				<header className="w-full flex items-center justify-left">
					<a href="/">
						<img src={logo} alt="logo" className="mr-4 h-8" />
					</a>
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuLink className={navigationMenuTriggerStyle()}>
									Works
								</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink className={navigationMenuTriggerStyle()}>
									Series
								</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink className={navigationMenuTriggerStyle()}>
									Config
								</NavigationMenuLink>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
					<div className="ml-auto">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button asChild variant="outline" size="icon">
									<a href="https://example.com">
										<BookOpen />
									</a>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Go to document</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</header>
				<Separator className="my-2" />
				<div className="container mx-auto">
					<Breadcrumb className="mb-2">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href="/">Home</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink href="/components">Components</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<DataTable
						columns={columns}
						data={
							[
								{
									id: "728ed52f",
									amount: 100,
									status: "pending",
									email: "m@example.com",
								},
								// ...
							] satisfies Payment[]
						}
					/>
				</div>
				<Separator className="my-2" />
				<footer className="mt-auto text-right text-muted-foreground">
					Copyright © 2026 kitta65
				</footer>
			</div>
		</TooltipProvider>
	);
}
