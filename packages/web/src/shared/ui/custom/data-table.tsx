// https://ui.shadcn.com/docs/components/radix/data-table
import {
	type ColumnDef,
	createColumnHelper as createColumnHelper_,
	type RowData,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/shadcn/table";

const features = tableFeatures({});

export function createColumnHelper<TValue extends RowData>() {
	return createColumnHelper_<typeof features, TValue>();
}

interface DataTableProps<TData extends RowData> {
	columns: ColumnDef<typeof features, TData>[];
	data: TData[];
}

export function DataTable<TData extends RowData>({
	columns,
	data,
}: DataTableProps<TData>) {
	const table = useTable({
		features,
		columns,
		data,
	});

	return (
		<div className="rounded-md border w-full">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : (
											<table.FlexRender header={header} />
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getAllCells().map((cell) => (
									<TableCell key={cell.id}>
										<table.FlexRender cell={cell} />
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
