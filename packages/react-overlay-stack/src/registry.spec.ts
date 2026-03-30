import { describe, expect, it } from "vitest";

import { createOverlayRegistry } from "./registry.js";

const DummyA = () => null;
const DummyB = () => null;

describe("createOverlayRegistry", () => {
	it("register adds component and resolve returns it", () => {
		const registry = createOverlayRegistry();
		const key = Symbol("modal");

		registry.getState().register(key, DummyA);

		expect(registry.getState().resolve(key)).toBe(DummyA);
	});

	it("resolve returns undefined for unknown key", () => {
		const registry = createOverlayRegistry();

		expect(registry.getState().resolve(Symbol("unknown"))).toBeUndefined();
	});

	it("double register increments ref count", () => {
		const registry = createOverlayRegistry();
		const key = Symbol("modal");

		registry.getState().register(key, DummyA);
		registry.getState().register(key, DummyA);

		// Single unregister should still resolve
		registry.getState().unregister(key);
		expect(registry.getState().resolve(key)).toBe(DummyA);
	});

	it("unregister at zero ref count removes component", () => {
		const registry = createOverlayRegistry();
		const key = Symbol("modal");

		registry.getState().register(key, DummyA);
		registry.getState().unregister(key);

		expect(registry.getState().resolve(key)).toBeUndefined();
	});

	it("double register then double unregister removes component", () => {
		const registry = createOverlayRegistry();
		const key = Symbol("modal");

		registry.getState().register(key, DummyA);
		registry.getState().register(key, DummyA);
		registry.getState().unregister(key);
		registry.getState().unregister(key);

		expect(registry.getState().resolve(key)).toBeUndefined();
	});

	it("duplicate key with different component overwrites", () => {
		const registry = createOverlayRegistry();
		const key = Symbol("modal");

		registry.getState().register(key, DummyA);
		registry.getState().register(key, DummyB);

		expect(registry.getState().resolve(key)).toBe(DummyB);
	});

	// eslint-disable-next-line vitest/expect-expect
	it("unregister on unknown key is a no-op", () => {
		const registry = createOverlayRegistry();

		// Should not throw
		registry.getState().unregister(Symbol("unknown"));
	});
});
