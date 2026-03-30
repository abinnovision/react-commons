import type { ComponentType } from "react";

declare const __overlayProps: unique symbol;
declare const __overlayResult: unique symbol;

/**
 * A typed overlay definition created via `defineOverlay()`.
 * Phantom types encode `TProps` and `TResult` for compile-time safety.
 */
export interface OverlayDefinition<TProps = never, TResult = undefined> {
	/**
	 * Internal key for registry lookup. Auto-generated symbol.
	 */
	readonly key: symbol;
	readonly component: OverlayComponent<TProps, TResult>;
	readonly [__overlayProps]: TProps;
	readonly [__overlayResult]: TResult;
}

/**
 *  Extract the props type from an overlay definition.
 */
export type OverlayProps<T> =
	T extends OverlayDefinition<infer P, any> ? P : never;

/**
 *  Extract the result type from an overlay definition.
 */
export type OverlayResult<T> =
	T extends OverlayDefinition<any, infer R> ? R : never;

/**
 *  Controller passed to every overlay component.
 */
export interface OverlayController<TResult = unknown> {
	readonly close: (result?: TResult) => void;
}

/**
 * The component type that overlays must satisfy.
 */
export type OverlayComponent<TProps = never, TResult = unknown> = [
	TProps,
] extends [never]
	? ComponentType<{ readonly controller: OverlayController<TResult> }>
	: ComponentType<TProps & { readonly controller: OverlayController<TResult> }>;

/**
 * Universal metadata exposed to UI wrapper components via `useOverlayContext()`.
 *
 * Does NOT include dialog-specific fields like `onOpenChange`.
 * UI wrappers wire those themselves:
 * ```
 * onOpenChange={(open) => { if (!open) controller.close(); }}
 * ```
 */
export interface OverlayMetadata {
	readonly id: string;
	readonly stackIndex: number;
	readonly isTopmost: boolean;
	readonly isOpen: boolean;
	readonly onAnimationEnd: () => void;
}

/** A single entry in the internal overlay stack. */
export interface OverlayStackEntry {
	readonly id: string;
	readonly overlayKey: symbol;
	readonly props: Record<string, unknown>;
	readonly isOpen: boolean;
}
