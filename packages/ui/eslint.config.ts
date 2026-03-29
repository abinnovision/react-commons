import {
	base,
	configFiles,
	stylistic,
	vitest,
} from "@abinnovision/eslint-config-base";
import { react, tailwind } from "@abinnovision/eslint-config-react";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	{ extends: [base, react, tailwind, vitest, stylistic] },
	{ files: ["*.{c,m,}{t,j}s"], extends: [configFiles] },
	globalIgnores(["**/*.generated.ts", "**/*.gen.ts", "dist"]),
]);
