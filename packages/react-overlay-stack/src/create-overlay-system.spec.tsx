import { act, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { useOverlayContext } from "./context.js";
import { createOverlaySystem } from "./create-overlay-system.js";
import { defineOverlay } from "./define-overlay.js";

import type { OverlayController } from "./types.js";

const TestOverlay = defineOverlay<{ title: string }, boolean>(
	({ title, controller }) => (
		<div>
			<span data-testid="title">{title}</span>
			<button
				data-testid="confirm"
				onClick={() => {
					controller.close(true);
				}}
			>
				Confirm
			</button>
			<button
				data-testid="dismiss"
				onClick={() => {
					controller.close();
				}}
			>
				Dismiss
			</button>
		</div>
	),
);

const MetadataComponent = ({
	label,
}: {
	label: string;
	controller: OverlayController<undefined>;
}) => {
	const meta = useOverlayContext();

	return (
		<div data-testid={`meta-${label}`}>
			{`idx:${String(meta.stackIndex)},top:${String(meta.isTopmost)},open:${String(meta.isOpen)}`}
		</div>
	);
};

describe("createOverlaySystem", () => {
	it("returns useOverlay and OverlayProvider", () => {
		const system = createOverlaySystem();

		expect(system.useOverlay).toBeTypeOf("function");
		expect(system.OverlayProvider).toBeTypeOf("function");
	});

	it("renders nothing when stack is empty", () => {
		const { OverlayProvider } = createOverlaySystem();

		const { container } = render(
			<OverlayProvider>
				<div data-testid="app">App</div>
			</OverlayProvider>,
		);

		expect(screen.getByTestId("app")).toBeTruthy();
		expect(container.querySelector("[data-testid='title']")).toBeNull();
	});

	it("opening an overlay renders the component", () => {
		const { useOverlay, OverlayProvider } = createOverlaySystem();

		const Consumer = () => {
			const overlay = useOverlay(TestOverlay);

			return (
				<button
					data-testid="open"
					onClick={() => overlay.open({ title: "Hello" })}
				>
					Open
				</button>
			);
		};

		render(
			<OverlayProvider>
				<Consumer />
			</OverlayProvider>,
		);

		act(() => {
			screen.getByTestId("open").click();
		});

		expect(screen.getByTestId("title").textContent).toBe("Hello");
	});

	it("controller.close() sets isOpen=false", () => {
		const { useOverlay, OverlayProvider } = createOverlaySystem();
		let capturedController: OverlayController<boolean> | undefined;

		const CapturingComponent = ({
			controller,
		}: {
			controller: OverlayController<boolean>;
		}) => {
			capturedController = controller;
			const meta = useOverlayContext();

			return <div data-testid="is-open">{String(meta.isOpen)}</div>;
		};

		const CapturingOverlay = defineOverlay<never, boolean>(CapturingComponent);

		const Consumer = () => {
			const overlay = useOverlay(CapturingOverlay);

			return (
				<button data-testid="open-capturing" onClick={() => overlay.open()}>
					Open
				</button>
			);
		};

		render(
			<OverlayProvider>
				<Consumer />
			</OverlayProvider>,
		);

		act(() => {
			screen.getByTestId("open-capturing").click();
		});
		expect(screen.getByTestId("is-open").textContent).toBe("true");

		act(() => {
			capturedController?.close();
		});
		expect(screen.getByTestId("is-open").textContent).toBe("false");
	});

	it("onAnimationEnd removes overlay from stack", () => {
		const { useOverlay, OverlayProvider } = createOverlaySystem();
		let capturedOnAnimationEnd: (() => void) | undefined;

		const AnimComponent = () => {
			const meta = useOverlayContext();
			capturedOnAnimationEnd = meta.onAnimationEnd;

			return <div data-testid="anim-overlay">Visible</div>;
		};

		const AnimOverlay = defineOverlay(AnimComponent);

		const Consumer = () => {
			const overlay = useOverlay(AnimOverlay);

			return (
				<button data-testid="open-anim" onClick={() => overlay.open()}>
					Open
				</button>
			);
		};

		render(
			<OverlayProvider>
				<Consumer />
			</OverlayProvider>,
		);

		act(() => {
			screen.getByTestId("open-anim").click();
		});
		expect(screen.getByTestId("anim-overlay")).toBeTruthy();

		// Close then animate out
		act(() => {
			capturedOnAnimationEnd?.();
		});

		expect(screen.queryByTestId("anim-overlay")).toBeNull();
	});

	it("multiple overlays render with correct stacking metadata", () => {
		const { useOverlay, OverlayProvider } = createOverlaySystem();

		const FirstOverlay = defineOverlay<{ label: string }>(MetadataComponent);

		const SecondOverlay = defineOverlay<{ label: string }>(MetadataComponent);

		const Consumer = () => {
			const first = useOverlay(FirstOverlay);
			const second = useOverlay(SecondOverlay);

			return (
				<>
					<button
						data-testid="open-first"
						onClick={() => first.open({ label: "first" })}
					>
						First
					</button>
					<button
						data-testid="open-second"
						onClick={() => second.open({ label: "second" })}
					>
						Second
					</button>
				</>
			);
		};

		render(
			<OverlayProvider>
				<Consumer />
			</OverlayProvider>,
		);

		act(() => {
			screen.getByTestId("open-first").click();
		});
		act(() => {
			screen.getByTestId("open-second").click();
		});

		expect(screen.getByTestId("meta-first").textContent).toBe(
			"idx:0,top:false,open:true",
		);
		expect(screen.getByTestId("meta-second").textContent).toBe(
			"idx:1,top:true,open:true",
		);
	});

	it("onClose callback receives result", () => {
		const { useOverlay, OverlayProvider } = createOverlaySystem();
		const onClose = vi.fn();

		let capturedOnAnimationEnd: (() => void) | undefined;

		const CallbackComponent = ({
			title,
			controller,
		}: {
			title: string;
			controller: OverlayController<boolean>;
		}) => {
			const meta = useOverlayContext();
			capturedOnAnimationEnd = meta.onAnimationEnd;

			return (
				<button
					data-testid="close-btn"
					onClick={() => {
						controller.close(true);
					}}
				>
					{title}
				</button>
			);
		};

		const CallbackOverlay = defineOverlay<{ title: string }, boolean>(
			CallbackComponent,
		);

		const Consumer = () => {
			const overlay = useOverlay(CallbackOverlay);

			return (
				<button
					data-testid="open2"
					onClick={() => overlay.open({ title: "CB" }, onClose)}
				>
					Open
				</button>
			);
		};

		render(
			<OverlayProvider>
				<Consumer />
			</OverlayProvider>,
		);

		act(() => {
			screen.getByTestId("open2").click();
		});
		act(() => {
			screen.getByTestId("close-btn").click();
		});
		// onClose not fired yet (waiting for animation end)
		expect(onClose).not.toHaveBeenCalled();

		act(() => {
			capturedOnAnimationEnd?.();
		});
		expect(onClose).toHaveBeenCalledWith(true);
	});

	it("provider overlays prop registers base overlays eagerly", () => {
		const { useOverlay, OverlayProvider } = createOverlaySystem();

		const BaseOverlay = defineOverlay<{ msg: string }>(({ msg }) => (
			<div data-testid="base">{msg}</div>
		));

		const Consumer = () => {
			const base = useOverlay(BaseOverlay);

			return (
				<button
					data-testid="open-base"
					onClick={() => base.open({ msg: "eager" })}
				>
					Open
				</button>
			);
		};

		render(
			<OverlayProvider overlays={[BaseOverlay]}>
				<Consumer />
			</OverlayProvider>,
		);

		act(() => {
			screen.getByTestId("open-base").click();
		});

		expect(screen.getByTestId("base").textContent).toBe("eager");
	});

	it("onOpenChange(false) closes the overlay without a result", () => {
		const { useOverlay, OverlayProvider } = createOverlaySystem();
		const onClose = vi.fn();

		let capturedMeta: ReturnType<typeof useOverlayContext> | undefined;

		const OpenChangeComponent = ({
			controller,
		}: {
			controller: OverlayController<boolean>;
		}) => {
			void controller;
			const meta = useOverlayContext();
			capturedMeta = meta;

			return <div data-testid="oc-open">{String(meta.isOpen)}</div>;
		};

		const OpenChangeOverlay = defineOverlay<never, boolean>(
			OpenChangeComponent,
		);

		const Consumer = () => {
			const overlay = useOverlay(OpenChangeOverlay);

			return (
				<button data-testid="open-oc" onClick={() => overlay.open(onClose)}>
					Open
				</button>
			);
		};

		render(
			<OverlayProvider>
				<Consumer />
			</OverlayProvider>,
		);

		act(() => {
			screen.getByTestId("open-oc").click();
		});
		expect(screen.getByTestId("oc-open").textContent).toBe("true");

		// Simulate UI lib firing onOpenChange(false)
		act(() => {
			capturedMeta?.onOpenChange(false);
		});
		expect(screen.getByTestId("oc-open").textContent).toBe("false");

		// Complete animation lifecycle
		act(() => {
			capturedMeta?.onAnimationEnd();
		});
		expect(onClose).toHaveBeenCalledWith(undefined);
	});

	it("onOpenChange(true) is a no-op", () => {
		const { useOverlay, OverlayProvider } = createOverlaySystem();

		let capturedMeta: ReturnType<typeof useOverlayContext> | undefined;

		const NoopComponent = ({
			controller,
		}: {
			controller: OverlayController<undefined>;
		}) => {
			void controller;
			const meta = useOverlayContext();
			capturedMeta = meta;

			return <div data-testid="noop-open">{String(meta.isOpen)}</div>;
		};

		const NoopOverlay = defineOverlay(NoopComponent);

		const Consumer = () => {
			const overlay = useOverlay(NoopOverlay);

			return (
				<button data-testid="open-noop" onClick={() => overlay.open()}>
					Open
				</button>
			);
		};

		render(
			<OverlayProvider>
				<Consumer />
			</OverlayProvider>,
		);

		act(() => {
			screen.getByTestId("open-noop").click();
		});

		// onOpenChange(true) should not affect state
		act(() => {
			capturedMeta?.onOpenChange(true);
		});
		expect(screen.getByTestId("noop-open").textContent).toBe("true");
	});

	it("onOpenChange(false) is idempotent when already closing", () => {
		const { useOverlay, OverlayProvider } = createOverlaySystem();

		let capturedMeta: ReturnType<typeof useOverlayContext> | undefined;
		let capturedController: OverlayController<boolean> | undefined;

		const IdempotentComponent = ({
			controller,
		}: {
			controller: OverlayController<boolean>;
		}) => {
			capturedController = controller;
			const meta = useOverlayContext();
			capturedMeta = meta;

			return <div data-testid="idem-open">{String(meta.isOpen)}</div>;
		};

		const IdempotentOverlay = defineOverlay<never, boolean>(
			IdempotentComponent,
		);

		const Consumer = () => {
			const overlay = useOverlay(IdempotentOverlay);

			return (
				<button data-testid="open-idem" onClick={() => overlay.open()}>
					Open
				</button>
			);
		};

		render(
			<OverlayProvider>
				<Consumer />
			</OverlayProvider>,
		);

		act(() => {
			screen.getByTestId("open-idem").click();
		});

		// Close with a result first
		act(() => {
			capturedController?.close(true);
		});
		expect(screen.getByTestId("idem-open").textContent).toBe("false");

		// Calling onOpenChange(false) again should not throw or change state
		act(() => {
			capturedMeta?.onOpenChange(false);
		});
		expect(screen.getByTestId("idem-open").textContent).toBe("false");
	});

	it("useOverlayContext throws outside provider", () => {
		const BadComponent = () => {
			useOverlayContext();

			return null;
		};

		expect(() => render(<BadComponent />)).toThrow(
			/useOverlayContext must be used within an overlay/,
		);
	});

	it("does not re-mount children when an overlay opens", () => {
		const { OverlayProvider, useOverlay } = createOverlaySystem();
		const unmountSpy = vi.fn();

		const Child = () => {
			React.useEffect(() => unmountSpy, []);

			return <div data-testid="stable-child">child</div>;
		};

		const Trigger = () => {
			const overlay = useOverlay(TestOverlay);

			return (
				<button
					data-testid="open-remount-test"
					onClick={() => {
						overlay.open({ title: "Hello" });
					}}
				>
					Open
				</button>
			);
		};

		render(
			<OverlayProvider>
				<Child />
				<Trigger />
			</OverlayProvider>,
		);

		expect(screen.getByTestId("stable-child").textContent).toBe("child");
		expect(unmountSpy).not.toHaveBeenCalled();

		act(() => {
			screen.getByTestId("open-remount-test").click();
		});

		expect(unmountSpy).not.toHaveBeenCalled();
	});

	// Type-level tests (compile-time checks — if the file compiles, they pass)
	// eslint-disable-next-line vitest/expect-expect
	it("type safety: wrong props cause compile error", () => {
		const { useOverlay } = createOverlaySystem();

		const TypeTest = () => {
			const overlay = useOverlay(TestOverlay);

			// Correct usage
			overlay.open({ title: "Valid" });

			// @ts-expect-error - missing required prop 'title'
			overlay.open({});

			// @ts-expect-error - wrong prop type
			overlay.open({ title: 123 });

			// @ts-expect-error - unknown prop
			overlay.open({ title: "Valid", unknown: true });

			return null;
		};

		void TypeTest;
	});
});
