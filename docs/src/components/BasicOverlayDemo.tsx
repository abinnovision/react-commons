import { useState, type FC } from "react";
import { defineOverlay, useOverlayContext } from "react-overlay-stack";

import { OverlayProvider, useOverlay } from "./overlay-setup.js";

const BasicPanel = defineOverlay<{ title: string }, string>(
  ({ title, controller }) => {
    const { isOpen, stackIndex, isTopmost, onAnimationEnd } =
      useOverlayContext();

    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 50 + stackIndex * 10 }}
      >
        <div
          className="absolute inset-0 bg-black/40 transition-opacity duration-200"
          style={{ opacity: isOpen ? 1 : 0 }}
          onClick={() => controller.close()}
          onTransitionEnd={() => {
            if (!isOpen) onAnimationEnd();
          }}
        />
        <div
          className="relative rounded-lg bg-white p-6 shadow-xl transition-all duration-200"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "scale(1)" : "scale(0.95)",
          }}
        >
          <p className="mb-2 text-sm text-gray-500">
            stackIndex: {stackIndex} | isTopmost: {String(isTopmost)} | isOpen:{" "}
            {String(isOpen)}
          </p>
          <h2 className="mb-4 text-lg font-semibold">{title}</h2>
          <div className="flex gap-2">
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white"
              onClick={() => controller.close("confirmed")}
            >
              Confirm
            </button>
            <button
              className="rounded bg-gray-200 px-4 py-2"
              onClick={() => controller.close()}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  },
);

const BasicDemoInner: FC = () => {
  const overlay = useOverlay(BasicPanel);
  const [lastResult, setLastResult] = useState<string | undefined>();

  return (
    <div className="flex flex-col gap-4">
      <button
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() =>
          overlay.open({ title: "Hello from Basic Overlay" }, (result) => {
            setLastResult(result);
          })
        }
      >
        Open Basic Overlay
      </button>
      {lastResult !== undefined && (
        <p className="text-sm text-gray-600">
          Last result: {lastResult ?? "(no value)"}
        </p>
      )}
    </div>
  );
};

export const BasicOverlayDemo: FC = () => (
  <OverlayProvider>
    <BasicDemoInner />
  </OverlayProvider>
);
