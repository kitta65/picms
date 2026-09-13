import { InfoIcon } from "lucide-react";
import { Button } from "@/shared/ui/shadcn/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/shared/ui/shadcn/popover";

type ContextualHelpProps = {
	title: string;
	description: string;
};
export function ContextualHelp({ title, description }: ContextualHelpProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon-xs"
					className="text-muted-foreground"
				>
					<InfoIcon />
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<PopoverHeader>
					<PopoverTitle>{title}</PopoverTitle>
				</PopoverHeader>
				<PopoverDescription>{description}</PopoverDescription>
			</PopoverContent>
		</Popover>
	);
}
