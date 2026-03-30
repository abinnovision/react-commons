import * as Dialog from "@radix-ui/react-dialog";
import { useOverlayContext } from "react-overlay-stack";

import type { FC, ReactNode } from "react";

interface CModalProps {
	children: ReactNode;
	className?: string;
}

const CModalRoot: FC<CModalProps> = ({ children, className }) => {
	const { isOpen, stackIndex, onAnimationEnd } = useOverlayContext();

	const overlayZIndex = 50 + stackIndex * 10;
	const contentZIndex = overlayZIndex + 1;

	return (
		<Dialog.Root open={true}>
			<Dialog.Portal>
				<Dialog.Overlay
					className="fixed inset-0 bg-black/50 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in"
					data-state={isOpen ? "open" : "closed"}
					style={{ zIndex: overlayZIndex }}
				/>
				<Dialog.Content
					className={`fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none data-[state=closed]:animate-zoom-out data-[state=open]:animate-zoom-in ${className ?? ""}`}
					data-state={isOpen ? "open" : "closed"}
					style={{ zIndex: contentZIndex }}
					onAnimationEnd={(event) => {
						if (event.currentTarget === event.target && !isOpen) {
							onAnimationEnd();
						}
					}}
				>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

interface CModalTitleProps {
	children: ReactNode;
}

const CModalTitle: FC<CModalTitleProps> = ({ children }) => (
	<Dialog.Title className="mb-2 text-lg font-semibold">{children}</Dialog.Title>
);

interface CModalDescriptionProps {
	children: ReactNode;
}

const CModalDescription: FC<CModalDescriptionProps> = ({ children }) => (
	<Dialog.Description className="mb-4 text-gray-600">
		{children}
	</Dialog.Description>
);

interface CModalFooterProps {
	children: ReactNode;
}

const CModalFooter: FC<CModalFooterProps> = ({ children }) => (
	<div className="flex gap-2">{children}</div>
);

export const CModal = Object.assign(CModalRoot, {
	Title: CModalTitle,
	Description: CModalDescription,
	Footer: CModalFooter,
});
