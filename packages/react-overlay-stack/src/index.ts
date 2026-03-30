// Types
export type {
	OverlayDefinition,
	OverlayProps,
	OverlayResult,
	OverlayController,
	OverlayComponent,
	OverlayMetadata,
} from "./types.js";

// Primary API
export { createOverlaySystem } from "./create-overlay-system.js";
export { defineOverlay } from "./define-overlay.js";
export { useOverlayContext } from "./context.js";
