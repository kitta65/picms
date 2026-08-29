import { Clock, Expand, ImageOffIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import type { Work } from "@/entities/work/model";
import { Preview } from "@/features/preview/ui";
import { useWorkQuery } from "@/pages/works/api";
import { createColumnHelper, DataTable } from "@/shared/ui/custom/data-table";
import { Button } from "@/shared/ui/shadcn/button";
import { ButtonGroup } from "@/shared/ui/shadcn/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/shadcn/tooltip";

const columnHelper = createColumnHelper<Work>();
const columns = columnHelper.columns([
	columnHelper.accessor("revisionId", {
		header: "Thumbnail",
		cell: ({ row }) => {
			if (!row.original.revisionId) {
				return <ImageOffIcon />;
			}

			return <img className="size-12" src={row.original.revisionId} alt="" />;
		},
	}),
	columnHelper.accessor("id", { header: "Id" }),
	columnHelper.accessor("title", { header: "Title" }),
	columnHelper.accessor("tags", { header: "Tags" }),
	columnHelper.accessor("createdAt", { header: "Created At" }),
	columnHelper.accessor("updatedAt", { header: "Updated At" }),
	columnHelper.display({
		id: "actions",
		cell: ({ row }) => {
			<ButtonGroup>
				<Tooltip>
					<Preview
						trigger={
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									disabled={row.original.revisionId == null}
								>
									<Expand />
								</Button>
							</TooltipTrigger>
						}
						data={{
							...row.original,
							url: row.original.revisionId ?? "https://example.com",
						}}
						currPage={1}
						lastPage={1}
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
			</ButtonGroup>;
		},
	}),
]);

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
	const { data } = useWorkQuery();
	return (
		<>
			<div className="flex justify-center items-center my-2 w-full">
				<Button size="sm" className="ml-auto" asChild>
					<Link to={`/works/new`}>New</Link>
				</Button>
			</div>
			<DataTable columns={columns} data={data ?? []} />
		</>
	);
}
