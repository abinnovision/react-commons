import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		starlight({
			title: "React Commons",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/abinnovision/react-commons",
				},
			],
			sidebar: [
				{ label: "Getting Started", slug: "getting-started" },
				{
					label: "react-overlay-stack",
					items: [
						{
							label: "Overview",
							slug: "packages/react-overlay-stack",
						},
						{
							label: "Getting Started",
							slug: "packages/react-overlay-stack/getting-started",
						},
						{
							label: "API Reference",
							slug: "packages/react-overlay-stack/api-reference",
						},
						{
							label: "Guides",
							autogenerate: {
								directory: "packages/react-overlay-stack/guides",
							},
						},
						{
							label: "Examples",
							slug: "packages/react-overlay-stack/examples",
						},
					],
				},
				{
					label: "Contributing",
					autogenerate: { directory: "contributing" },
				},
			],
			customCss: ["./src/styles.css"],
		}),
		react(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
