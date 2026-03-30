import { createContext, use } from "react";

import type { OverlayMetadata } from "./types.js";

export const OverlayContext = createContext<OverlayMetadata | null>(null);

/**
 * Access overlay metadata from within an overlay component.
 *
 * Must be used inside a component rendered by `OverlayProvider`.
 */
export const useOverlayContext = (): OverlayMetadata => {
	const context = use(OverlayContext);
	if (!context) {
		throw new Error(
			"[react-overlay-stack] useOverlayContext must be used within an overlay rendered by OverlayProvider.",
		);
	}

	return context;
};
