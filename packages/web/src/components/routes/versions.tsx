import type { ColumnDef } from "@tanstack/react-table";
import { Expand } from "lucide-react";
import { DataTable } from "@/components/layouts/data-table";
import { Preview } from "@/components/layouts/preview";
import { Button } from "@/components/ui/button";

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
			<Preview
				trigger={
					<Button variant="ghost" size="icon">
						<Expand />
					</Button>
				}
				srcs={[
					"https://raw.githubusercontent.com/kitta65/picms/refs/heads/main/packages/web/src/logo.svg",
					"https://raw.githubusercontent.com/kitta65/picms/refs/heads/main/packages/web/src/logo-icon.svg",
				]}
				titles={["foo", "bar"]}
			/>
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
