import type { ColumnDef } from "@tanstack/react-table";
import { Expand } from "lucide-react";
import { useMemo } from "react";
import type { Version } from "@/entities/revision/model";
import { Preview } from "@/features/preview/ui";
import { DataTable } from "@/shared/ui/custom/data-table";
import { Button } from "@/shared/ui/shadcn/button";

export function Versions() {
	const data = [
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
				"https://raw.githubusercontent.com/kitta65/picms/refs/heads/main/packages/web/src/logo-icon.svg",
			createdAt: new Date(),
		},
		// ...
	] satisfies Version[];

	const columns: (ColumnDef<Version> & { accessorKey?: keyof Version })[] =
		useMemo(
			() => [
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
					cell: ({ row }) => (
						<Preview
							trigger={
								<Button variant="ghost" size="icon">
									<Expand />
								</Button>
							}
							baseIdx={row.index}
							data={data}
						/>
					),
				},
			],
			[data],
		);

	return <DataTable columns={columns} data={data} />;
}
