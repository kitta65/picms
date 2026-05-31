import type { ColumnDef } from "@tanstack/react-table";
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

import { DataTable } from "./components/ui/data-table";
import logo from "./logo.svg";

type Work = {
	id: string;
	thumbnail: string;
	title: string;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
};

const columns: ColumnDef<Work>[] = [
	{
		accessorKey: "id",
		header: "Id",
	},
	{
		accessorKey: "thumbnail",
		header: "Thumbnail",
	},
	{
		accessorKey: "title",
		header: "Title",
	},
	{
		accessorKey: "tags",
		header: "Tags",
	},
	{
		accessorKey: "createdAt",
		header: "CreatedAt",
	},
	{
		accessorKey: "updatedAt",
		header: "UpdatedAt",
	},
];

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
									Settings
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
									thumbnail:
										"https://raw.githubusercontent.com/kitta65/picms/refs/heads/main/packages/web/src/logo.svg",
									title: "sample",
									tags: ["foo", "bar"],
									createdAt: new Date(),
									updatedAt: new Date(),
								},
								// ...
							] satisfies Work[]
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
