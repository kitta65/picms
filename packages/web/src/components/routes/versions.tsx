import type { ColumnDef } from "@tanstack/react-table";
import { Expand } from "lucide-react";
import { DataTable } from "@/components/layouts/data-table";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type Version = {
	id: string;
	thumbnail: string;
	createdAt: Date;
};

const columns: (ColumnDef<Version> & { accessorKey?: keyof Version })[] = [
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
		accessorKey: "createdAt",
		header: "CreatedAt",
	},
	{
		id: "action",
		cell: ({ row: _row }) => (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => console.warn("TODO: expand image")}
					>
						<Expand />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Expand</p>
				</TooltipContent>
			</Tooltip>
		),
	},
];

export function Versions() {
	return (
		<DataTable
			columns={columns}
			data={
				[
					{
						id: "728ed52f",
						thumbnail:
							"https://raw.githubusercontent.com/kitta65/picms/refs/heads/main/packages/web/src/logo.svg",
						createdAt: new Date(),
					},
					{
						id: "728ed52g",
						thumbnail:
							"https://raw.githubusercontent.com/kitta65/picms/refs/heads/main/packages/web/src/logo.svg",
						createdAt: new Date(),
					},
					{
						id: "728ed52h",
						thumbnail:
							"https://raw.githubusercontent.com/kitta65/picms/refs/heads/main/packages/web/src/logo.svg",
						createdAt: new Date(),
					},
					// ...
				] satisfies Version[]
			}
		/>
	);
}
