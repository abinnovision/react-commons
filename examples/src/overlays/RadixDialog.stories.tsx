import { defineOverlay } from "react-overlay-stack";

import { CModal } from "../components/CModal.js";
import { OverlayProvider, useOverlay } from "../setup.js";

import type { Meta, StoryObj } from "@storybook/react";
import type { FC } from "react";

const ConfirmDialog = defineOverlay<
	{ title: string; message: string },
	boolean
>(({ title, message, controller }) => (
	<CModal>
		<CModal.Title>{title}</CModal.Title>
		<CModal.Description>{message}</CModal.Description>
		<CModal.Footer>
			<button
				className="rounded bg-blue-600 px-4 py-2 text-white"
				onClick={() => {
					controller.close(true);
				}}
			>
				Confirm
			</button>
			<button
				className="rounded bg-gray-200 px-4 py-2"
				onClick={() => {
					controller.close(false);
				}}
			>
				Cancel
			</button>
		</CModal.Footer>
	</CModal>
));

const RadixDemo: FC = () => {
	const confirm = useOverlay(ConfirmDialog);

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-xl font-bold">Radix Dialog</h1>
			<button
				className="rounded bg-blue-600 px-4 py-2 text-white"
				onClick={() =>
					confirm.open(
						{ title: "Delete item?", message: "This action cannot be undone." },
						(result) => {
							// eslint-disable-next-line no-console
							console.log("Confirmed:", result);
						},
					)
				}
			>
				Open Confirm Dialog
			</button>
		</div>
	);
};

const meta: Meta = {
	title: "Overlays/Radix Dialog",
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
	render: () => <RadixDemo />,
};
