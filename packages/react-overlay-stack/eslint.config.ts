import {
	base,
	configFiles,
	stylistic,
	vitest,
} from "@abinnovision/eslint-config-base";
import { react } from "@abinnovision/eslint-config-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{ extends: [base, vitest, stylistic, react] },
	{ files: ["*.{c,m,}{t,j}s"], extends: [configFiles] },
]);
