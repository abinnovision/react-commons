import { useOverlayContext } from "react-overlay-stack";
import { Drawer } from "vaul";

import type { FC, ReactNode } from "react";

const VAUL_ANIMATION_DURATION = 500;

interface CDrawerProps {
	children: ReactNode;
	className?: string;
}

const CDrawerRoot: FC<CDrawerProps> = ({ children, className }) => {
	const { isOpen, stackIndex, onAnimationEnd } = useOverlayContext();

	const overlayZIndex = 50 + stackIndex * 10;
	const contentZIndex = overlayZIndex + 1;

	return (
		<Drawer.Root
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					setTimeout(onAnimationEnd, VAUL_ANIMATION_DURATION);
				}
			}}
		>
			<Drawer.Portal>
				<Drawer.Overlay
					className="fixed inset-0 bg-black/40"
					style={{ zIndex: overlayZIndex }}
				/>
				<Drawer.Content
					className={`fixed inset-x-0 bottom-0 rounded-t-xl bg-white focus:outline-none ${className ?? ""}`}
					style={{ zIndex: contentZIndex }}
				>
					<div className="mx-auto mb-4 mt-3 h-1.5 w-12 rounded-full bg-gray-300" />
					{children}
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
};

interface CDrawerTitleProps {
	children: ReactNode;
}

const CDrawerTitle: FC<CDrawerTitleProps> = ({ children }) => (
	<Drawer.Title className="mb-4 px-6 text-lg font-semibold">
		{children}
	</Drawer.Title>
);

interface CDrawerContentProps {
	children: ReactNode;
}

const CDrawerContent: FC<CDrawerContentProps> = ({ children }) => (
	<div className="px-6 pb-6">{children}</div>
);

export const CDrawer = Object.assign(CDrawerRoot, {
	Title: CDrawerTitle,
	Content: CDrawerContent,
});
