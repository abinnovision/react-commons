import { base, configFiles, stylistic } from "@abinnovision/eslint-config-base";
import { react } from "@abinnovision/eslint-config-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{ extends: [base, stylistic, react] },
	{ files: ["*.{c,m,}{t,j}s"], extends: [configFiles] },
]);
