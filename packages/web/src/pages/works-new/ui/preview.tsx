import { ImageIcon } from "lucide-react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/shared/ui/shadcn/empty";

type PreviewProps = {
	url: string | null;
};
export function Preview({ url }: PreviewProps) {
	return (
		<div className="flex item-center justify-center h-60">
			{url ? (
				<img src={url} alt={url} />
			) : (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ImageIcon />
						</EmptyMedia>
						<EmptyTitle>No File</EmptyTitle>
						<EmptyDescription>No file is selected</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
