import { ConstructionIcon } from "lucide-react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/shared/ui/shadcn/empty";
export function NotImplemented() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<ConstructionIcon />
				</EmptyMedia>

				<EmptyTitle>Not Implemented</EmptyTitle>
				<EmptyDescription>
					The content you are looking for is not implemented.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
