import type { OverlayComponent, OverlayDefinition } from "./types.js";

/**
 * Define a typed overlay.
 *
 * ```ts
 * const ConfirmModal = defineOverlay<{ title: string }, boolean>(
 *   ({ title, controller }) => { ... },
 * );
 * ```
 */
export const defineOverlay = <TProps = never, TResult = undefined>(
	component: OverlayComponent<TProps, TResult>,
): OverlayDefinition<TProps, TResult> =>
	({
		key: Symbol("overlay"),
		component,
	}) as unknown as OverlayDefinition<TProps, TResult>;
