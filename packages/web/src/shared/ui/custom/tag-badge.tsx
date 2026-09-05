import { HashIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TextWithTooltip } from "@/shared/ui/custom/text";
import { Badge } from "@/shared/ui/shadcn/badge";

type TagBadgeProps = {
	children: string;
	as?: "span" | "button";
	icon?: ReactNode;
	onClick?: () => void;
} & Parameters<typeof Badge>[0];
export function TagBadge({
	children,
	as,
	icon: icon_,
	onClick,
	...props
}: TagBadgeProps) {
	const inner = (
		<TextWithTooltip className="max-w-40">{children}</TextWithTooltip>
	);

	const icon = icon_ ?? <HashIcon data-icon="inline-start" />;

	let outer: ReactNode = null;
	switch (as) {
		case "button":
			outer = (
				<button type="button" onClick={onClick}>
					{icon}
					{inner}
				</button>
			);
			break;
		default:
			outer = (
				<span>
					{icon}
					{inner}
				</span>
			);
	}

	return (
		<Badge asChild variant="secondary" {...props}>
			{outer}
		</Badge>
	);
}
