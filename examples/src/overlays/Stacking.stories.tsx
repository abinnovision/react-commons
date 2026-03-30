import { useRef } from "react";
import { defineOverlay, useOverlayContext } from "react-overlay-stack";

import { CModal } from "../components/CModal.js";
import { OverlayProvider, useOverlay } from "../setup.js";

import type { Meta, StoryObj } from "@storybook/react";
import type { FC } from "react";

const MAX_DEPTH = 5;
const LAYER_COLORS = ["#fecaca", "#bbf7d0", "#bfdbfe", "#fde68a", "#e9d5ff"];

const StackableOverlay = defineOverlay<{
	depth: number;
	onOpenNext: (depth: number) => void;
}>(({ depth, onOpenNext, controller }) => {
	const { stackIndex, isTopmost } = useOverlayContext();

	const color = LAYER_COLORS[depth % LAYER_COLORS.length] ?? "#e5e7eb";
	const canOpenNext = depth + 1 < MAX_DEPTH;

	return (
		<CModal className={`max-w-sm`}>
			<div className="rounded-t-lg p-1" style={{ backgroundColor: color }}>
				<div className="flex items-center justify-between px-3 py-2">
					<h3 className="font-bold">Layer {depth + 1}</h3>
					<span className="rounded bg-black/10 px-2 py-0.5 font-mono text-xs">
						idx:{stackIndex} top:{String(isTopmost)}
					</span>
				</div>
			</div>
			<div className="p-4">
				<p className="mb-4 text-sm text-gray-700">
					Overlay #{depth + 1} in the stack. Open another on top or close this
					one.
				</p>
				<div className="flex gap-2">
					{canOpenNext ? (
						<button
							className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
							onClick={() => {
								onOpenNext(depth + 1);
							}}
						>
							Open Next
						</button>
					) : (
						<span className="text-xs text-gray-400">Max depth reached</span>
					)}
					<button
						className="rounded bg-gray-200 px-3 py-1.5 text-sm"
						onClick={() => {
							controller.close();
						}}
					>
						Close
					</button>
				</div>
			</div>
		</CModal>
	);
});

const StackingDemo: FC = () => {
	const overlay = useOverlay(StackableOverlay);
	const openRef = useRef<((depth: number) => void) | null>(null);

	openRef.current = (depth: number) => {
		overlay.open({
			depth,
			onOpenNext: (next: number) => {
				openRef.current?.(next);
			},
		});
	};

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-xl font-bold">Stacking Test</h1>
			<p className="max-w-md text-sm text-gray-600">
				Opens overlays that cascade. Each overlay can open another on top. Watch
				the stackIndex and isTopmost metadata update as layers are added and
				removed.
			</p>
			<button
				className="rounded bg-blue-600 px-4 py-2 text-white"
				onClick={() => {
					openRef.current?.(0);
				}}
			>
				Open First Overlay
			</button>
		</div>
	);
};

const meta: Meta = {
	title: "Overlays/Stacking",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<OverlayProvider>
				<div className="flex min-h-screen items-center justify-center">
					<Story />
				</div>
			</OverlayProvider>
		),
	],
};

export default meta;

export const Default: StoryObj = {
	render: () => <StackingDemo />,
};
