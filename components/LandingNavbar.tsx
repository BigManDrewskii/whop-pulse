"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, Sun, Moon } from "lucide-react";

export function LandingNavbar() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");
		setIsDark(savedTheme === "dark" || document.documentElement.classList.contains("dark"));
	}, []);

	const toggleTheme = () => {
		const newTheme = !isDark;
		setIsDark(newTheme);
		document.documentElement.classList.toggle("dark", newTheme);
		localStorage.setItem("theme", newTheme ? "dark" : "light");
	};

	return (
		<nav className="bg-white dark:bg-gray-900 border-b-2 border-gray-300 dark:border-gray-800 sticky top-0 z-50 shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link
						href="/discover"
						className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-primary-600 transition-colors"
					>
						<div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
							<Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
						</div>
						<span>Pulse</span>
					</Link>

					{/* Right Side */}
					<div className="flex items-center gap-3">
						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
							aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
						>
							{isDark ? (
								<Sun className="w-5 h-5 text-gray-600" />
							) : (
								<Moon className="w-5 h-5 text-gray-600" />
							)}
						</button>

						{/* CTA Button */}
						<Link
							href="https://whop.com/apps/app_kYOQwOZSTaTdhi/install/"
							className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
						>
							Install App
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
