import { Clock, Expand, ImageIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useConfigQuery } from "@/entities/config/api";
import { RevisionImage, type RevisionImageProps } from "@/entities/revision/ui";
import type { Work } from "@/entities/work/model";
import { Preview } from "@/features/preview/ui";
import { useWorkQuery } from "@/pages/works/api";
import {
	createColumnHelper,
	useDataTable,
} from "@/shared/ui/custom/data-table";
import { DateWithTz } from "@/shared/ui/custom/date-with-tz";
import { Button } from "@/shared/ui/shadcn/button";
import { ButtonGroup } from "@/shared/ui/shadcn/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/shadcn/tooltip";
import { cn } from "@/shared/ui/shadcn/utils";

const columnHelper = createColumnHelper<Work>();
const columns = columnHelper.columns([
	columnHelper.accessor("revisionId", {
		header: "",
		cell: (info) => <ThumbnailCell revisionId={info.getValue()} />,
	}),
	columnHelper.accessor("title", { header: "Title" }),
	columnHelper.accessor("tags", { header: "Tags" }),
	columnHelper.accessor("createdAt", {
		header: "Created At",
		cell: (info) => <DateCell date={info.getValue()} />,
	}),
	columnHelper.accessor("updatedAt", {
		header: "Updated At",
		cell: (info) => <DateCell date={info.getValue()} />,
	}),
	columnHelper.display({
		id: "actions",
		cell: ({ row }) => (
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
						currPage={row.index + 1}
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
			</ButtonGroup>
		),
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
	const { data, isLoading } = useWorkQuery();
	const dataTable = useDataTable({ columns, data: data ?? [] });

	return (
		<>
			<div className="flex justify-center items-center my-2 w-full">
				<Button size="sm" className="ml-auto" asChild>
					<Link to={`/works/new`}>New</Link>
				</Button>
			</div>
			{/* TODO: use skeleton */}
			{isLoading ? null : <dataTable.Render />}
		</>
	);
}

type DateCellProps = {
	date: Date;
};
function DateCell({ date }: DateCellProps) {
	const { data, isLoading } = useConfigQuery();
	// TODO: use skeleton
	if (isLoading) return null;
	return <DateWithTz date={date} timezone={data?.timezone} />;
}

type ThumbnailCellProps = {
	revisionId?: string | null;
};
function ThumbnailCell({ revisionId }: ThumbnailCellProps) {
	let image = <ImageIcon className="text-muted-foreground" />;

	if (revisionId) {
		const props: RevisionImageProps = {
			id: revisionId,
			mode: "contain",
			size: "36x36",
		};
		image = <RevisionImage {...props} />;
	}

	return <div className={cn("flex justify-center items-center")}>{image}</div>;
}
