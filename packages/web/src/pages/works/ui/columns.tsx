import { Clock, Expand, ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { useConfigQuery } from "@/entities/config/api";
import { RevisionImage, type RevisionImageProps } from "@/entities/revision/ui";
import type { Work } from "@/entities/work/model";
import { createColumnHelper } from "@/shared/ui/custom/data-table";
import { DateWithTz } from "@/shared/ui/custom/date-with-tz";
import { TagBadge } from "@/shared/ui/custom/tag-badge";
import { TextWithTooltip } from "@/shared/ui/custom/text";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { ButtonGroup } from "@/shared/ui/shadcn/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/shadcn/tooltip";
import { cn } from "@/shared/ui/shadcn/utils";

const columnHelper = createColumnHelper<Work>();

export function createColumns({
	onPreview,
}: {
	onPreview: (idx: number) => void;
}) {
	return columnHelper.columns([
		columnHelper.accessor("revisionId", {
			header: "",
			cell: (info) => <ThumbnailCell revisionId={info.getValue()} />,
		}),
		columnHelper.accessor("title", {
			header: "Title",
			cell: (info) => <TextCell>{info.getValue()}</TextCell>,
		}),
		columnHelper.accessor("description", {
			header: "Description",
			cell: (info) => <TextCell>{info.getValue()}</TextCell>,
		}),
		columnHelper.accessor("tags", {
			header: "Tags",
			cell: (info) => <TagsCell tags={info.getValue()} />,
		}),
		columnHelper.accessor("public", {
			header: "Visibility",
			cell: (info) => <VisibilityCell isPublic={info.getValue()} />,
		}),
		columnHelper.accessor("createdAt", {
			header: "Created at",
			cell: (info) => <DateCell date={info.getValue()} />,
		}),
		columnHelper.accessor("updatedAt", {
			header: "Updated at",
			cell: (info) => <DateCell date={info.getValue()} />,
		}),
		columnHelper.display({
			id: "actions",
			cell: ({ row }) => (
				<ActionCell
					workId={row.original.id}
					isDisabledPreview={row.original.revisionId == null}
					onPreview={() => onPreview(row.getDisplayIndex())}
				/>
			),
		}),
	]);
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
			revisionId,
			mode: "inside",
			size: "42x42",
		};
		image = <RevisionImage {...props} />;
	}

	return <div className={cn("flex justify-center items-center")}>{image}</div>;
}

type TagsCellProps = {
	tags: string[];
};
function TagsCell({ tags }: TagsCellProps) {
	const maxTagsToShow = 2;
	const length = tags.length;
	return (
		<div className="flex gap-x-1 items-center">
			<div className="flex flex-col gap-1">
				{tags.slice(0, 2).map((t) => (
					<TagBadge key={t}>{t}</TagBadge>
				))}
			</div>
			{maxTagsToShow < length && (
				<span className="text-muted-foreground">{`+${length - maxTagsToShow} more`}</span>
			)}
		</div>
	);
}

function TextCell({ children }: React.ComponentProps<"span">) {
	return (
		<TextWithTooltip className="max-w-40 inline-block">
			{children}
		</TextWithTooltip>
	);
}

type VisibilityCellProps = {
	isPublic: boolean;
};
function VisibilityCell({ isPublic }: VisibilityCellProps) {
	if (isPublic) {
		return <Badge>public</Badge>;
	} else {
		return <Badge variant="secondary">private</Badge>;
	}
}

type ActionCellProps = {
	workId: string;
	isDisabledPreview: boolean;
	onPreview: () => void;
};
function ActionCell({ workId, isDisabledPreview, onPreview }: ActionCellProps) {
	return (
		<ButtonGroup>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						disabled={isDisabledPreview}
						onClick={onPreview}
					>
						<Expand />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Expand</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button asChild variant="ghost" size="icon">
						<Link to={`/works/${workId}/versions`}>
							<Clock />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>View versions</p>
				</TooltipContent>
			</Tooltip>
		</ButtonGroup>
	);
}
