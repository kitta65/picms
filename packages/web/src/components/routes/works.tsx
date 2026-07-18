import type { ColumnDef } from "@tanstack/react-table";
import { Clock, Expand } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useLocation, useParams } from "wouter";

import { DataTable } from "@/components/layouts/data-table";
import { Preview } from "@/components/layouts/preview";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Work } from "@/lib/types";

function useWorkId() {
	const params = useParams();
	const [location, setLocation] = useLocation();
	useEffect(() => {
		const mayBeId = params[0];
		if (!mayBeId) return;

		console.warn(`TODO: filter by workId: ${mayBeId}`);
		setLocation(location.slice(0, -(mayBeId.length + 1)), { replace: true });
	});
}

export function Works() {
	useWorkId();
	const data = useData();
	const columns: (ColumnDef<Work> & { accessorKey?: keyof Work })[] = useMemo(
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
					<ButtonGroup>
						<Tooltip>
							<Preview
								data={data}
								baseIdx={row.index}
								trigger={
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon">
											<Expand />
										</Button>
									</TooltipTrigger>
								}
							/>
							<TooltipContent>
								<p>Expand</p>
							</TooltipContent>
						</Tooltip>
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
					</ButtonGroup>
				),
			},
		],
		[data],
	);

	return (
		<>
			<div className="flex justify-center items-center my-2 w-full">
				<Button size="sm" className="ml-auto" asChild>
					<Link to={`/works/new`}>New</Link>
				</Button>
			</div>
			<DataTable columns={columns} data={data} />
		</>
	);
}

function useData() {
	return [
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
	] satisfies Work[];
}
