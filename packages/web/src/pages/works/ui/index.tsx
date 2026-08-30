import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { Preview } from "@/features/preview/ui";
import { useWorkQuery } from "@/pages/works/api";
import { createColumns } from "@/pages/works/ui/columns";
import { useDataTable } from "@/shared/ui/custom/data-table";
import { Button } from "@/shared/ui/shadcn/button";

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
	const [previewIdx, setPreviewIdx] = useState(0);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const columns = createColumns({
		onPreview: (idx: number) => {
			setPreviewIdx(idx);
			setIsPreviewOpen(true);
		},
	});
	const dataTable = useDataTable({ columns, data: data ?? [] });
	const model = dataTable.table.getSortedRowModel().rows.at(previewIdx);

	// NOTE:
	// I don't know if filtering data table immediately changes the value of dataLength defined here.
	// You should test the behaviour after implementing such feature.
	const dataLength = dataTable.table.getSortedRowModel().rows.length;
	const onPrev =
		previewIdx <= 0 ? undefined : () => setPreviewIdx(previewIdx - 1);
	const onNext =
		dataLength <= previewIdx + 1
			? undefined
			: () => setPreviewIdx(previewIdx + 1);

	return (
		<>
			<div className="flex justify-center items-center my-2 w-full">
				<Button size="sm" className="ml-auto" asChild>
					<Link to={`/works/new`}>New</Link>
				</Button>
			</div>
			{/* TODO: use skeleton */}
			{isLoading ? null : <dataTable.Render />}
			{model && (
				<Preview
					data={model.original}
					isOpen={isPreviewOpen}
					setIsOpen={setIsPreviewOpen}
					currPage={previewIdx}
					lastPage={dataTable.table.getCoreRowModel().rows.length}
					onPrev={onPrev}
					onNext={onNext}
				/>
			)}
		</>
	);
}
