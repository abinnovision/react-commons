import { createStore } from "zustand/vanilla";

import type { OverlayStackEntry } from "./types.js";

interface OverlayStoreState {
	readonly stack: readonly OverlayStackEntry[];
	readonly open: (overlayKey: symbol, props: Record<string, unknown>) => string;
	readonly close: (id: string, result?: unknown) => void;
	readonly closeAll: () => void;
	readonly removeFromStack: (id: string) => void;
}

let idCounter = 0;

const generateId = (): string => {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	return `instance-${String(++idCounter)}`;
};

export const createOverlayStore = () => {
	const onCloseCallbacks = new Map<string, (result?: unknown) => void>();
	const closeResults = new Map<string, unknown>();

	const store = createStore<OverlayStoreState>((set, get) => ({
		stack: [],

		open: (overlayKey, props) => {
			const id = generateId();

			set((state) => ({
				stack: [...state.stack, { id, overlayKey, props, isOpen: true }],
			}));

			return id;
		},

		close: (id, result) => {
			const entry = get().stack.find((e) => e.id === id);
			if (!entry || !entry.isOpen) {
				return;
			}

			if (result !== undefined) {
				closeResults.set(id, result);
			}

			set((state) => ({
				stack: state.stack.map((e) =>
					e.id === id ? { ...e, isOpen: false } : e,
				),
			}));
		},

		closeAll: () => {
			set((state) => ({
				stack: state.stack.map((e) => (e.isOpen ? { ...e, isOpen: false } : e)),
			}));
		},

		removeFromStack: (id) => {
			const entry = get().stack.find((e) => e.id === id);
			if (!entry) {
				return;
			}

			set((state) => ({
				stack: state.stack.filter((e) => e.id !== id),
			}));

			const callback = onCloseCallbacks.get(id);
			if (callback) {
				const result = closeResults.get(id);
				callback(result);
			}

			onCloseCallbacks.delete(id);
			closeResults.delete(id);
		},
	}));

	const registerOnClose = (
		id: string,
		callback: (result?: unknown) => void,
	) => {
		onCloseCallbacks.set(id, callback);
	};

	return { store, registerOnClose };
};

export type { OverlayStoreState };
export type OverlayStore = ReturnType<typeof createOverlayStore>;
