import type { ColumnDef } from "@tanstack/react-table";
import { Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type Work = {
	id: string;
	thumbnail: string;
	title: string;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
};

const columns: (ColumnDef<Work> & { accessorKey?: keyof Work })[] = [
	{
		accessorKey: "thumbnail",
		cell: ({ row }) => (
			<img className="size-12" src={row.original.thumbnail} alt="" />
		),
	},
	{
		accessorKey: "id",
		header: "Id",
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
	{
		id: "action",
		cell: ({ row }) => (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button asChild variant="ghost" size="icon">
						<Link to={`/works/${row.original.id}/versions`}>
							<Clock />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>View versions</p>
				</TooltipContent>
			</Tooltip>
		),
	},
];

export function Works() {
	return (
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
					{
						id: "728ed52g",
						thumbnail:
							"https://raw.githubusercontent.com/kitta65/picms/refs/heads/main/packages/web/src/logo.svg",
						title: "sample",
						tags: ["foo", "bar"],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						id: "728ed52h",
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
	);
}
