import { type ReactNode, useState } from "react";
import { Button } from "@/shared/ui/shadcn/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/ui/shadcn/dialog";

type ConfirmDialogProps = {
	asChild: boolean;
	children: ReactNode;
	title: string;
	description: string;
	onSelectYes: () => Promise<void>;
};
export function ConfirmDialog({
	title,
	description,
	children,
	asChild,
	onSelectYes,
}: ConfirmDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isBusy, setIsBusy] = useState(false);
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild={asChild}>{children}</DialogTrigger>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={isBusy}>
							No
						</Button>
					</DialogClose>
					<Button
						onClick={() => {
							setIsBusy(true);
							onSelectYes().finally(() => {
								setIsOpen(false);
								setIsBusy(false);
							});
						}}
						disabled={isBusy}
					>
						Yes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
