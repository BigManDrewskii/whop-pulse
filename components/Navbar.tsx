"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Building, Settings, HelpCircle, User, LogOut, Sun, Moon, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const [isDark, setIsDark] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Get companyId from pathname
	const companyId = pathname?.match(/\/dashboard\/([^\/]+)/)?.[1] || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || "";

	// Check theme on mount (with localStorage protection for Whop iframe)
	useEffect(() => {
		try {
			const savedTheme = localStorage.getItem("theme");
			setIsDark(savedTheme === "dark" || document.documentElement.classList.contains("dark"));
		} catch (error) {
			// localStorage might not work in Whop iframe - use default
			console.warn("[Navbar] localStorage not available, using default theme");
			setIsDark(false);
		}
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowProfileMenu(false);
			}
		}

		if (showProfileMenu) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [showProfileMenu]);

	const toggleTheme = () => {
		const newTheme = !isDark;
		setIsDark(newTheme);
		document.documentElement.classList.toggle("dark", newTheme);

		// Try to save theme preference (may not work in Whop iframe)
		try {
			localStorage.setItem("theme", newTheme ? "dark" : "light");
		} catch (error) {
			console.warn("[Navbar] Could not save theme preference");
		}
	};

	const handleLogout = async () => {
		setIsLoggingOut(true);
		setShowProfileMenu(false);

		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});

			const data = await response.json();

			if (response.ok) {
				// Redirect to logged-out page
				router.push("/logged-out");
			} else {
				console.error("Logout failed:", data);
				alert("Logout failed. Please try again.");
				setIsLoggingOut(false);
			}
		} catch (error) {
			console.error("Logout error:", error);
			alert("Logout failed. Please try again.");
			setIsLoggingOut(false);
		}
	};

	const navLinks = [
		{ href: `/dashboard/${companyId}`, label: "Dashboard", icon: Activity },
		{ href: `/dashboard/${companyId}/settings`, label: "Settings", icon: Settings },
		{ href: `/dashboard/${companyId}/help`, label: "Help", icon: HelpCircle },
	];

	return (
		<nav className="bg-white dark:bg-gray-900 border-b-2 border-gray-300 dark:border-gray-800 sticky top-0 z-40 shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo/Brand */}
					<Link
						href={`/dashboard/${companyId}`}
						className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
					>
						<div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
							<Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
						</div>
						<span>Pulse</span>
					</Link>

					{/* Navigation Links - Center */}
					<div className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => {
							const isActive = pathname === link.href;
							const Icon = link.icon;
							return (
								<Link
									key={link.href}
									href={link.href}
									className={`
										flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
										${
											isActive
												? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
												: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
										}
									`}
								>
									<Icon className="w-4 h-4" />
									{link.label}
								</Link>
							);
						})}
					</div>

					{/* Right Side - Company & User */}
					<div className="flex items-center gap-3">
						{/* Company Badge */}
						<div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
							<Building className="w-4 h-4 text-gray-600 dark:text-gray-400" />
							<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
								STUDIO DREWSKII
							</span>
						</div>

						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
						>
							{isDark ? (
								<Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
							) : (
								<Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
							)}
						</button>

						{/* User Profile Menu */}
						<div className="relative">
							<button
								onClick={() => setShowProfileMenu(!showProfileMenu)}
								className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
								aria-label="User menu"
							>
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
									U
								</div>
							</button>

							{/* Dropdown Menu */}
							{showProfileMenu && (
								<div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg shadow-lg py-1">
									<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
										<p className="text-sm font-semibold text-gray-900 dark:text-white">
											User Account
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
											Company Admin
										</p>
									</div>
									<button
										onClick={toggleTheme}
										className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
									>
										{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
										{isDark ? "Light Mode" : "Dark Mode"}
									</button>
									<button
										onClick={handleLogout}
										disabled={isLoggingOut}
										className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
											isLoggingOut
												? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
												: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
										}`}
									>
										<LogOut className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`} />
										{isLoggingOut ? "Logging out..." : "Logout"}
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Mobile Navigation */}
				<div className="md:hidden pb-3 flex gap-2 overflow-x-auto">
					{navLinks.map((link) => {
						const isActive = pathname === link.href;
						const Icon = link.icon;
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`
									flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all
									${
										isActive
											? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
											: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
									}
								`}
							>
								<Icon className="w-4 h-4" />
								{link.label}
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
}
