import tailwindcss from "@tailwindcss/vite";

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.tsx"],
	framework: "@storybook/react-vite",
	viteFinal: (config) => {
		config.plugins ??= [];
		config.plugins.push(tailwindcss());

		return config;
	},
};

export default config;
