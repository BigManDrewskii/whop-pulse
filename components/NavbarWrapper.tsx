"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function NavbarWrapper() {
	const pathname = usePathname();

	// Hide navbar on /discover page (marketing/landing page)
	if (pathname === "/discover" || pathname === "/") {
		return null;
	}

	return <Navbar />;
}
