import {
	Download,
	ExternalLink,
	EyeClosed,
	MoveLeft,
	MoveRight,
	X,
} from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	ButtonGroup,
	ButtonGroupSeparator,
} from "@/components/ui/button-group";
import type { Version } from "@/lib/types";
import { cn } from "@/lib/utils";

const Z = cn("z-50");
const MERGIN = cn("m-4");
// NOTE: this class does not work outside the group
const ANIMATION = cn(
	"group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=open]:animate-in group-data-[state=open]:fade-in-0",
);

type PreviewProps = {
	trigger: React.ReactNode;
	data: Version[];
	baseIdx: number;
};
export function Preview({ trigger, data, baseIdx }: PreviewProps) {
	const [idx, setIdx] = useState(baseIdx);
	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay
					className={cn("group fixed inset-0 bg-black/90", ANIMATION, Z)}
				/>
				<Dialog.Content className="dark group">
					<img
						src={data[idx]?.thumbnail}
						alt=""
						className={cn(
							"fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
							"object-contain max-w-[calc(100%-8rem)] max-h-[calc(100%-8rem)]",
							ANIMATION,
							Z,
						)}
					/>
					<div
						className={cn(
							"fixed top-0 left-0 text-foreground h-9",
							"flex items-start justify-center flex-col",
							Z,
							MERGIN,
							ANIMATION,
						)}
					>
						<Dialog.Title className="text-sm">foo</Dialog.Title>
						<Dialog.Description className="text-muted-foreground text-xs">
							fuga
						</Dialog.Description>
					</div>
					<ButtonGroup
						className={cn("fixed right-0 top-0", Z, MERGIN, ANIMATION)}
					>
						<Button size="icon">
							<EyeClosed />
						</Button>
						<Button size="icon">
							<ExternalLink />
						</Button>
						<Button size="icon">
							<Download />
						</Button>
						<ButtonGroupSeparator className={cn("bg-transparent")} />
						<Dialog.Close asChild>
							<Button size="icon">
								<X />
							</Button>
						</Dialog.Close>
					</ButtonGroup>

					{/* this div is required to prevent the dialog from closing when disabled button is clicked */}
					<div
						className={cn(
							"fixed top-1/2 left-0 -translate-y-1/2",
							Z,
							MERGIN,
							ANIMATION,
						)}
					>
						<Button
							size="icon"
							disabled={idx <= 0}
							onClick={() => setIdx(idx - 1)}
						>
							<MoveLeft />
						</Button>
					</div>
					<div
						className={cn(
							"fixed top-1/2 right-0 -translate-y-1/2",
							Z,
							MERGIN,
							ANIMATION,
						)}
					>
						<Button
							size="icon"
							disabled={data.length - 1 <= idx}
							onClick={() => setIdx(idx + 1)}
						>
							<MoveRight />
						</Button>
					</div>

					<span
						className={cn(
							"fixed bottom-0 left-1/2 -translate-x-1/2 h-9 text-foreground text-sm",
							Z,
							MERGIN,
							ANIMATION,
						)}
					>
						{`${idx + 1} / ${data.length}`}
					</span>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
