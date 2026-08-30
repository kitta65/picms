import { useEffect, useRef, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/shadcn/tooltip";
import { cn } from "@/shared/ui/shadcn/utils";

type TextWithTooltipProps = React.ComponentProps<"span">;
export function TextWithTooltip({ children, ...props_ }: TextWithTooltipProps) {
	const [isTruncated, setIsTruncated] = useState(false);
	const ref = useRef<HTMLElement>(null);
	const props = {
		...props_,
		className: cn(props_.className, "truncate"),
		ref,
	};
	const elm = <span {...props}>{children}</span>;

	useEffect(() => {
		const el = ref.current;
		if (el) {
			setIsTruncated(el.scrollWidth > el.clientWidth);
		}
	}, []);

	if (!isTruncated) {
		return elm;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{elm}</TooltipTrigger>
			<TooltipContent className="max-w-60 wrap-anywhere">
				{children}
			</TooltipContent>
		</Tooltip>
	);
}
