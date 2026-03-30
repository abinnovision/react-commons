import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "react-overlay-stack#unit",
		include: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
		environment: "happy-dom",
	},
});
