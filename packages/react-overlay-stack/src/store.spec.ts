import { describe, expect, it, vi } from "vitest";

import { createOverlayStore } from "./store.js";

describe("createOverlayStore", () => {
	it("returns independent stores", () => {
		const a = createOverlayStore();
		const b = createOverlayStore();

		a.store.getState().open(Symbol("test"), {});
		expect(a.store.getState().stack).toHaveLength(1);
		expect(b.store.getState().stack).toHaveLength(0);
	});

	it("open adds entry with isOpen=true and returns unique ID", () => {
		const { store } = createOverlayStore();

		const key = Symbol("modal");
		const id = store.getState().open(key, { title: "Hello" });

		expect(id).toBeTruthy();
		expect(store.getState().stack).toHaveLength(1);
		expect(store.getState().stack[0]).toEqual({
			id,
			overlayKey: key,
			props: { title: "Hello" },
			isOpen: true,
		});
	});

	it("open returns unique IDs for each call", () => {
		const { store } = createOverlayStore();

		const id1 = store.getState().open(Symbol("a"), {});
		const id2 = store.getState().open(Symbol("b"), {});

		expect(id1).not.toBe(id2);
	});

	it("close sets isOpen=false but keeps entry in stack", () => {
		const { store } = createOverlayStore();

		const id = store.getState().open(Symbol("modal"), {});
		store.getState().close(id);

		expect(store.getState().stack).toHaveLength(1);
		expect(store.getState().stack[0]?.isOpen).toBe(false);
	});

	it("close on already-closed entry is a no-op", () => {
		const { store } = createOverlayStore();

		const id = store.getState().open(Symbol("modal"), {});
		store.getState().close(id);

		const stackAfterFirstClose = store.getState().stack;
		store.getState().close(id);

		expect(store.getState().stack).toEqual(stackAfterFirstClose);
	});

	it("close on non-existent ID is a no-op", () => {
		const { store } = createOverlayStore();

		store.getState().open(Symbol("modal"), {});
		const stackBefore = store.getState().stack;
		store.getState().close("non-existent");

		expect(store.getState().stack).toEqual(stackBefore);
	});

	it("closeAll sets all entries to isOpen=false", () => {
		const { store } = createOverlayStore();

		store.getState().open(Symbol("a"), {});
		store.getState().open(Symbol("b"), {});
		store.getState().closeAll();

		for (const entry of store.getState().stack) {
			expect(entry.isOpen).toBe(false);
		}
	});

	it("removeFromStack removes entry from stack", () => {
		const { store } = createOverlayStore();

		const id = store.getState().open(Symbol("modal"), {});
		store.getState().close(id);
		store.getState().removeFromStack(id);

		expect(store.getState().stack).toHaveLength(0);
	});

	it("removeFromStack for non-existent ID is a no-op", () => {
		const { store } = createOverlayStore();

		store.getState().open(Symbol("modal"), {});
		store.getState().removeFromStack("non-existent");

		expect(store.getState().stack).toHaveLength(1);
	});

	it("removeFromStack fires onClose callback with result", () => {
		const { store, registerOnClose } = createOverlayStore();
		const onClose = vi.fn();

		const id = store.getState().open(Symbol("modal"), {});
		registerOnClose(id, onClose);
		store.getState().close(id, "confirmed");
		store.getState().removeFromStack(id);

		expect(onClose).toHaveBeenCalledWith("confirmed");
	});

	it("removeFromStack fires onClose with undefined when closed without result", () => {
		const { store, registerOnClose } = createOverlayStore();
		const onClose = vi.fn();

		const id = store.getState().open(Symbol("modal"), {});
		registerOnClose(id, onClose);
		store.getState().close(id);
		store.getState().removeFromStack(id);

		expect(onClose).toHaveBeenCalledWith(undefined);
	});

	it("multiple sequential opens produce correct stack order", () => {
		const { store } = createOverlayStore();

		const first = Symbol("first");
		const second = Symbol("second");
		const third = Symbol("third");

		store.getState().open(first, {});
		store.getState().open(second, {});
		store.getState().open(third, {});

		const keys = store.getState().stack.map((e) => e.overlayKey);
		expect(keys).toEqual([first, second, third]);
	});

	it("concurrent: opening same overlay name while previous is closing creates separate entries", () => {
		const { store } = createOverlayStore();

		const id1 = store.getState().open(Symbol("modal"), {});
		store.getState().close(id1);
		const id2 = store.getState().open(Symbol("modal"), {});

		expect(store.getState().stack).toHaveLength(2);
		expect(id1).not.toBe(id2);
		expect(store.getState().stack[0]?.isOpen).toBe(false);
		expect(store.getState().stack[1]?.isOpen).toBe(true);
	});

	it("full lifecycle: open → close(result) → removeFromStack → onClose receives result", () => {
		const { store, registerOnClose } = createOverlayStore();
		const onClose = vi.fn();

		const id = store.getState().open(Symbol("confirm"), { title: "Delete?" });
		registerOnClose(id, onClose);

		// Close with result
		store.getState().close(id, true);
		expect(store.getState().stack[0]?.isOpen).toBe(false);
		expect(onClose).not.toHaveBeenCalled();

		// Animation ends → remove
		store.getState().removeFromStack(id);
		expect(store.getState().stack).toHaveLength(0);
		expect(onClose).toHaveBeenCalledExactlyOnceWith(true);
	});

	it("onClose callbacks are per-store-instance", () => {
		const storeA = createOverlayStore();
		const storeB = createOverlayStore();
		const onCloseA = vi.fn();
		const onCloseB = vi.fn();

		const idA = storeA.store.getState().open(Symbol("modal"), {});
		storeA.registerOnClose(idA, onCloseA);

		const idB = storeB.store.getState().open(Symbol("modal"), {});
		storeB.registerOnClose(idB, onCloseB);

		storeA.store.getState().close(idA, "a");
		storeA.store.getState().removeFromStack(idA);

		expect(onCloseA).toHaveBeenCalledWith("a");
		expect(onCloseB).not.toHaveBeenCalled();
	});
});
