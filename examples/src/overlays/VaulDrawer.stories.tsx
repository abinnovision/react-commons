import { defineOverlay } from "react-overlay-stack";

import { CDrawer } from "../components/CDrawer.js";
import { OverlayProvider, useOverlay } from "../setup.js";

import type { Meta, StoryObj } from "@storybook/react";
import type { FC } from "react";

const SelectDrawer = defineOverlay<{ title: string }, string>(
	({ title, controller }) => (
		<CDrawer>
			<CDrawer.Title>{title}</CDrawer.Title>
			<CDrawer.Content>
				<div className="flex flex-col gap-2">
					<button
						className="rounded bg-blue-600 px-4 py-2 text-white"
						onClick={() => {
							controller.close("selected");
						}}
					>
						Select
					</button>
					<button
						className="rounded bg-gray-200 px-4 py-2"
						onClick={() => {
							controller.close();
						}}
					>
						Cancel
					</button>
				</div>
			</CDrawer.Content>
		</CDrawer>
	),
);

const VaulDemo: FC = () => {
	const drawer = useOverlay(SelectDrawer);

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-xl font-bold">Vaul Drawer</h1>
			<button
				className="rounded bg-blue-600 px-4 py-2 text-white"
				onClick={() =>
					drawer.open({ title: "Choose an option" }, (result) => {
						// eslint-disable-next-line no-console
						console.log("Drawer result:", result);
					})
				}
			>
				Open Drawer
			</button>
		</div>
	);
};

const meta: Meta = {
	title: "Overlays/Vaul Drawer",
	decorators: [
		(Story) => (
			<OverlayProvider>
				<Story />
			</OverlayProvider>
		),
	],
};

export default meta;

export const Default: StoryObj = {
	render: () => <VaulDemo />,
};
