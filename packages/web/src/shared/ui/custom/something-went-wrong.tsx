import { CircleAlert } from "lucide-react";
import { Button } from "@/shared/ui/shadcn/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/shared/ui/shadcn/empty";

const GITHUB_ISSUE_LINK = "https://github.com/kitta65/picms/issues";

export function SomethingWentWrong() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<CircleAlert />
				</EmptyMedia>

				<EmptyTitle>Something Went Wrong.</EmptyTitle>
				<EmptyDescription>
					Unexpected error. If you suspect a bug, feel free to report it on
					GitHub.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button asChild size="sm">
					<a href={GITHUB_ISSUE_LINK} target="_blank" rel="noopner noreferrer">
						Report Issue
					</a>
				</Button>
			</EmptyContent>
		</Empty>
	);
}
