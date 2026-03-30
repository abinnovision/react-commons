import { createStore } from "zustand/vanilla";

import type { OverlayComponent } from "./types.js";

interface RegistryEntry {
	readonly component: OverlayComponent;
	refCount: number;
}

export interface OverlayRegistryState {
	/**
	 * Internal counter whenever something changes.
	 */
	readonly revision: number;

	readonly resolve: (key: symbol) => OverlayComponent | undefined;
	readonly register: (key: symbol, component: OverlayComponent) => void;
	readonly unregister: (key: symbol) => void;
}

export const createOverlayRegistry = () => {
	const entries = new Map<symbol, RegistryEntry>();

	return createStore<OverlayRegistryState>((set) => ({
		revision: 0,

		resolve: (key) => entries.get(key)?.component,

		register: (key, component) => {
			const existing = entries.get(key);

			if (existing) {
				/*
				 * This should really never happen if the public api has been used.
				 * Only possible when there is some kind of forging with the component property.
				 */
				if (existing.component !== component) {
					entries.set(key, { component, refCount: existing.refCount + 1 });
				} else {
					existing.refCount++;
				}
			} else {
				entries.set(key, { component, refCount: 1 });
			}

			set((state) => ({ revision: state.revision + 1 }));
		},

		unregister: (key) => {
			const existing = entries.get(key);
			if (!existing) {
				return;
			}

			existing.refCount--;
			if (existing.refCount <= 0) {
				entries.delete(key);
			}

			set((state) => ({ revision: state.revision + 1 }));
		},
	}));
};

export type OverlayRegistry = ReturnType<typeof createOverlayRegistry>;
