import type { ColumnDef } from "@tanstack/react-table";
import { Header } from "@/components/layouts/header";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";

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

export function Works() {
	return (
		<div className="mx-6 my-2">
			<Header />
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
	);
}
