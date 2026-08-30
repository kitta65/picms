import {
	Download,
	ExternalLink,
	EyeClosed,
	MoveLeft,
	MoveRight,
	X,
} from "lucide-react";
import { Dialog } from "radix-ui";
import { RevisionImage } from "@/entities/revision/ui";
import type { IPreviewable } from "@/features/preview/model";
import { Button } from "@/shared/ui/shadcn/button";
import {
	ButtonGroup,
	ButtonGroupSeparator,
} from "@/shared/ui/shadcn/button-group";
import { cn } from "@/shared/ui/shadcn/utils";

const MERGIN = cn("m-4");
const ANIMATION = cn(
	"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
);

type PreviewProps = {
	data: IPreviewable;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	currPage: number;
	lastPage: number;
	onPrev?: () => void;
	onNext?: () => void;
};
export function Preview({
	data,
	isOpen,
	setIsOpen,
	currPage,
	lastPage,
	onPrev,
	onNext,
}: PreviewProps) {
	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Portal>
				<Dialog.Overlay
					className={cn("fixed inset-0 bg-black/90", ANIMATION)}
				/>
				<Dialog.Content
					className={cn(
						"dark group fixed inset-0 pointer-events-none!",
						ANIMATION,
					)}
				>
					<div
						className={cn(
							"fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
							"pointer-events-auto",
						)}
					>
						{data.revisionId ? (
							<RevisionImage
								revisionId={data.revisionId}
								size="1200x1200"
								mode="contain"
								className="object-contain max-h-[calc(100vh-8rem)] max-w-[calc(100vw-8rem)]"
							/>
						) : (
							<span className="text-foreground">Not found</span>
						)}
					</div>
					<div
						className={cn(
							"fixed top-0 left-0 text-foreground h-9",
							"flex items-start justify-center flex-col",
							"pointer-events-auto",
							MERGIN,
						)}
					>
						<Dialog.Title className="text-sm">{data.title}</Dialog.Title>
						<Dialog.Description className="text-muted-foreground text-xs">
							{data.description}
						</Dialog.Description>
					</div>
					<ButtonGroup
						className={cn("fixed right-0 top-0", "pointer-events-auto", MERGIN)}
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
							"pointer-events-auto",
							MERGIN,
						)}
					>
						<Button
							size="icon"
							disabled={!onPrev}
							aria-label="Previous"
							onClick={onPrev}
						>
							<MoveLeft />
						</Button>
					</div>
					<div
						className={cn(
							"fixed top-1/2 right-0 -translate-y-1/2",
							"pointer-events-auto",
							MERGIN,
						)}
					>
						<Button
							size="icon"
							disabled={!onNext}
							aria-label="Next"
							onClick={onNext}
						>
							<MoveRight />
						</Button>
					</div>

					<span
						className={cn(
							"fixed bottom-0 left-1/2 -translate-x-1/2 h-9 text-foreground text-sm",

							"pointer-events-auto",
							MERGIN,
						)}
					>
						{`${currPage} / ${lastPage}`}
					</span>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
