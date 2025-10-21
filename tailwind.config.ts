import type { Config } from "tailwindcss";

export default {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// Primary brand colors using CSS variables
				primary: {
					DEFAULT: "var(--indigo-9)",
					50: "var(--indigo-1)",
					100: "var(--indigo-2)",
					200: "var(--indigo-3)",
					300: "var(--indigo-4)",
					400: "var(--indigo-5)",
					500: "var(--indigo-6)",
					600: "var(--indigo-9)",
					700: "var(--indigo-10)",
					800: "var(--indigo-11)",
					900: "var(--indigo-12)",
				},
				// Success color scale (Green)
				success: {
					DEFAULT: "var(--color-success)",
					50: "var(--success-1)",
					100: "var(--success-2)",
					200: "var(--success-3)",
					300: "var(--success-4)",
					400: "var(--success-5)",
					500: "var(--success-6)",
					600: "var(--success-7)",
					700: "var(--success-8)",
					800: "var(--success-9)",
					900: "var(--success-12)",
				},
				// Warning color scale (Yellow)
				warning: {
					DEFAULT: "var(--color-warning)",
					50: "var(--warning-1)",
					100: "var(--warning-2)",
					200: "var(--warning-3)",
					300: "var(--warning-4)",
					400: "var(--warning-5)",
					500: "var(--warning-6)",
					600: "var(--warning-7)",
					700: "var(--warning-8)",
					800: "var(--warning-9)",
					900: "var(--warning-12)",
				},
				// Error color scale (Red)
				error: {
					DEFAULT: "var(--color-error)",
					50: "var(--error-1)",
					100: "var(--error-2)",
					200: "var(--error-3)",
					300: "var(--error-4)",
					400: "var(--error-5)",
					500: "var(--error-6)",
					600: "var(--error-7)",
					700: "var(--error-8)",
					800: "var(--error-9)",
					900: "var(--error-12)",
				},
				// Semantic colors
				background: "var(--color-background)",
				panel: "var(--color-panel)",
				surface: "var(--color-surface)",
				foreground: "var(--color-text)",
				secondary: "var(--color-text-secondary)",
				tertiary: "var(--color-text-tertiary)",
				border: "var(--color-border)",
				"border-subtle": "var(--color-border-subtle)",
			},
		},
	},
	plugins: [],
} satisfies Config;
