import { cn } from "cn";
import {
	ClockIcon,
	EllipsisIcon,
	ExpandIcon,
	ImageIcon,
	PencilIcon,
	TagIcon,
	TrashIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useConfigQuery } from "@/entities/config/api";
import { RevisionImage, type RevisionImageProps } from "@/entities/revision/ui";
import { useWorkDeletion } from "@/entities/work/api";
import type { Work } from "@/entities/work/model";
import { ROUTE } from "@/shared/routes";
import { ConfirmDialog } from "@/shared/ui/custom/confirm-dialog";
import { createColumnHelper } from "@/shared/ui/custom/data-table";
import { DateWithTz } from "@/shared/ui/custom/date-with-tz";
import { TagBadge } from "@/shared/ui/custom/tag-badge";
import { TextWithTooltip } from "@/shared/ui/custom/text";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { ButtonGroup } from "@/shared/ui/shadcn/button-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/shadcn/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/shared/ui/shadcn/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/shadcn/tooltip";

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
			// prevent the row height from being stretched by 1px
			meta: { cellClassName: "py-0" },
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

	return <div className="flex justify-center items-center">{image}</div>;
}

type TagsCellProps = {
	tags: string[];
};
function TagsCell({ tags }: TagsCellProps) {
	const maxTagsToShow = 2;
	return (
		<div className="flex items-center gap-x-1">
			<div className="flex flex-col gap-1">
				{tags.slice(0, maxTagsToShow).map((t) => (
					<TagBadge key={t}>{t}</TagBadge>
				))}
			</div>
			{maxTagsToShow < tags.length && (
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="xs">
							+{tags.length - maxTagsToShow} More
							<TagIcon data-icon="inline-end" />
						</Button>
					</PopoverTrigger>
					<PopoverContent>
						<PopoverHeader>
							<PopoverTitle>All tags</PopoverTitle>
						</PopoverHeader>
						<div className="gap-1 flex flex-wrap mt-2">
							{tags.map((t) => (
								<TagBadge key={t}>{t}</TagBadge>
							))}
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}

function TextCell({ children }: React.ComponentProps<"span">) {
	return (
		<TextWithTooltip className={cn("max-w-40 inline-block")}>
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
						<ExpandIcon />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Expand</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button asChild variant="ghost" size="icon">
						<Link to={ROUTE.WORKS_EDIT.getLink({ workId })}>
							<PencilIcon />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Edit</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button asChild variant="ghost" size="icon">
						<Link to={ROUTE.REVISIONS.getLink({ workId })}>
							<ClockIcon />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>View versions</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<ActionDropdown asChild workId={workId}>
						<Button variant="ghost" size="icon">
							<EllipsisIcon />
						</Button>
					</ActionDropdown>
				</TooltipTrigger>
				<TooltipContent>
					<p>More</p>
				</TooltipContent>
			</Tooltip>
		</ButtonGroup>
	);
}

type ActionDropdownProps = {
	workId: string;
	children: ReactNode;
	asChild: boolean;
};
function ActionDropdown({ workId, children, asChild }: ActionDropdownProps) {
	const { mutateAsync } = useWorkDeletion();
	const onDeletion = async () => {
		await mutateAsync(workId).then(
			() => toast.success("Deleted!"),
			() => toast.error("Something went wrong."),
		);
	};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={asChild}>{children}</DropdownMenuTrigger>
			<DropdownMenuContent>
				<ConfirmDialog
					asChild
					title="Are you sure you want to delete this?"
					description="This action cannot be undone."
					onSelectYes={onDeletion}
				>
					<DropdownMenuItem
						variant="destructive"
						// do not close when clicked
						onSelect={(e) => e.preventDefault()}
					>
						<TrashIcon /> Delete
					</DropdownMenuItem>
				</ConfirmDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
