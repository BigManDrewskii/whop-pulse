"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		// Check localStorage first, then system preference
		const savedTheme = localStorage.getItem("theme");
		const prefersDark =
			savedTheme === "dark" ||
			(!savedTheme &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);

		setIsDark(prefersDark);

		// Apply theme class
		document.documentElement.classList.toggle("dark", prefersDark);
	}, []);

	const toggleTheme = () => {
		const newTheme = !isDark;
		setIsDark(newTheme);
		document.documentElement.classList.toggle("dark", newTheme);

		// Save preference
		localStorage.setItem("theme", newTheme ? "dark" : "light");
	};

	return (
		<button
			onClick={toggleTheme}
			title={isDark ? "Switch to light mode" : "Switch to dark mode"}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl hover:scale-110 active:scale-95"
		>
			{isDark ? "☀️" : "🌙"}
		</button>
	);
}
