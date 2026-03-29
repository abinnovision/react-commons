import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "@internal/ui#unit",
		include: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
		environment: "happy-dom",
	},
});
