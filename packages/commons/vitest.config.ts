import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "@internal/commons#unit",
		include: ["src/**/*.spec.ts"],
		environment: "node",
	},
});
