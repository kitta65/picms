import { HashIcon, TrashIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { ButtonGroup } from "@/shared/ui/shadcn/button-group";
import { Input } from "@/shared/ui/shadcn/input";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/shadcn/tooltip";
import { cn } from "@/shared/ui/shadcn/utils";

type InputTagsProps = Omit<React.ComponentProps<"input">, "onChange"> & {
	tags: string[];
	onChange: (s: string[]) => void;
};

export function InputTags({
	className,
	tags,
	onChange,
	...props
}: InputTagsProps) {
	const [value_, setValue] = useState("");
	const value = value_.trim();
	const handleEnter = () => {
		setValue("");
		const newTags = [...tags];
		if (tags.every((t) => t !== value)) {
			newTags.push(value);
		}
		onChange(newTags);
	};
	const handleRemove = (tag: string) => {
		const newTags = tags.filter((t) => t !== tag);
		onChange(newTags);
	};

	return (
		<div className={cn("flex flex-col gap-y-2", className)}>
			<ButtonGroup>
				<Input
					{...props}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.nativeEvent.isComposing) {
							e.preventDefault();
							if (0 < value.length) {
								handleEnter();
							}
						}
						props.onKeyDown?.(e);
					}}
				/>
				<Button
					variant="outline"
					type="button"
					onClick={handleEnter}
					disabled={value.length <= 0}
				>
					Add
				</Button>
			</ButtonGroup>
			<div className="flex flex-wrap gap-x-1 gap-y-1">
				{tags.map((t) => (
					<TagBadge key={t} onClick={() => handleRemove(t)}>
						{t}
					</TagBadge>
				))}
			</div>
		</div>
	);
}

type TagBadgeProps = {
	children: ReactNode;
	onClick: () => void;
};
function TagBadge({ children, onClick }: TagBadgeProps) {
	const spanRef = useRef<HTMLSpanElement>(null);
	const [isTruncated, setIsTruncated] = useState(false);

	useEffect(() => {
		const el = spanRef.current;
		if (el) {
			setIsTruncated(el.scrollWidth > el.clientWidth);
		}
	}, []);

	const badge = (
		<Badge asChild variant="secondary" className="group">
			<button type="button" onClick={onClick}>
				<HashIcon
					data-icon="inline-start"
					className="group-hover:hidden group-focus:hidden"
				/>
				<TrashIcon
					data-icon="inline-start"
					className="hidden group-hover:block group-focus:block text-destructive"
				/>
				<span
					ref={spanRef}
					className={cn(
						"max-w-40 truncate",
						" group-hover:text-destructive group-focus:text-destructive",
					)}
				>
					{children}
				</span>
			</button>
		</Badge>
	);

	if (!isTruncated) {
		return badge;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{badge}</TooltipTrigger>
			<TooltipContent>{children}</TooltipContent>
		</Tooltip>
	);
}
