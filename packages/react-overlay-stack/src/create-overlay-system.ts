import {
	createElement,
	Fragment,
	useEffect,
	useMemo,
	type FC,
	type ReactNode,
} from "react";
import { useStore } from "zustand";

import { OverlayContext } from "./context.js";
import { createOverlayRegistry } from "./registry.js";
import { createOverlayStore } from "./store.js";

import type {
	OverlayController,
	OverlayDefinition,
	OverlayMetadata,
	OverlayProps,
	OverlayResult,
} from "./types.js";

type OpenFn<T extends OverlayDefinition<any, any>> = [OverlayProps<T>] extends [
	never,
]
	? (onClose?: (result?: OverlayResult<T>) => void) => string
	: (
			props: OverlayProps<T>,
			onClose?: (result?: OverlayResult<T>) => void,
		) => string;

export interface UseOverlayReturn<T extends OverlayDefinition<any, any>> {
	readonly open: OpenFn<T>;
	readonly close: (id: string, result?: OverlayResult<T>) => void;
	readonly closeAll: () => void;
}

export interface OverlayProviderProps {
	readonly children: ReactNode;
	readonly overlays?: readonly OverlayDefinition<any, any>[];
}

/**
 * Create an independent overlay system with its own Provider and Hook.
 *
 * ```ts
 * const { useOverlay, OverlayProvider } = createOverlaySystem();
 * ```
 */
export const createOverlaySystem = () => {
	const { store, registerOnClose } = createOverlayStore();
	const registry = createOverlayRegistry();

	const useOverlay = <T extends OverlayDefinition<any, any>>(
		overlay: T,
	): UseOverlayReturn<T> => {
		useEffect(() => {
			registry.getState().register(overlay.key, overlay.component);

			return () => {
				registry.getState().unregister(overlay.key);
			};
		}, [overlay.key, overlay.component]);

		return useMemo(
			() => ({
				open: ((...args: unknown[]) => {
					const hasProps = args.length > 0 && typeof args[0] !== "function";
					const props = hasProps ? (args[0] as Record<string, unknown>) : {};
					const onClose = (hasProps ? args[1] : args[0]) as
						| ((result?: unknown) => void)
						| undefined;

					const id = store.getState().open(overlay.key, props);
					if (onClose) {
						registerOnClose(id, onClose);
					}

					return id;
				}) as OpenFn<T>,
				close: (id: string, result?: OverlayResult<T>) => {
					store.getState().close(id, result);
				},
				closeAll: () => {
					store.getState().closeAll();
				},
			}),
			[overlay.key],
		);
	};

	const OverlayProvider: FC<OverlayProviderProps> = ({
		children,
		overlays,
	}) => {
		// Register base overlays eagerly
		useEffect(() => {
			if (!overlays) {
				return;
			}

			for (const o of overlays) {
				registry.getState().register(o.key, o.component);
			}

			return () => {
				for (const o of overlays) {
					registry.getState().unregister(o.key);
				}
			};
		}, [overlays]);

		const stack = useStore(store, (s) => s.stack);

		// Force re-render when registry changes so newly registered overlays render
		useStore(registry, (s) => s.revision);

		const stackElements = stack.map((entry, index) => {
			const Component = registry.getState().resolve(entry.overlayKey);
			if (!Component) {
				return null;
			}

			const isTopmost = index === stack.length - 1;

			const controller: OverlayController = {
				close: (result?: unknown) => {
					store.getState().close(entry.id, result);
				},
			};

			const metadata: OverlayMetadata = {
				id: entry.id,
				stackIndex: index,
				isTopmost,
				isOpen: entry.isOpen,
				onAnimationEnd: () => {
					store.getState().removeFromStack(entry.id);
				},
				onOpenChange: (open: boolean) => {
					if (!open) {
						store.getState().close(entry.id);
					}
				},
			};

			return createElement(
				OverlayContext.Provider,
				{ key: entry.id, value: metadata },
				createElement(Component, {
					...entry.props,
					controller,
				}),
			);
		});

		return createElement(
			Fragment,
			null,
			children,
			createElement(Fragment, null, ...stackElements),
		);
	};

	return { useOverlay, OverlayProvider } as const;
};
