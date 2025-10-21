import type { Metadata } from "next";
import { LandingNavbar } from "@/components/LandingNavbar";
import { DiscoverClientUI } from "./client-ui";

export const metadata: Metadata = {
	title: "Pulse - Member Activity Monitor for Whop",
	description:
		"Track member engagement, identify at-risk members, and boost retention in your Whop community. Get instant insights into your community health.",
	keywords: [
		"whop",
		"member engagement",
		"community management",
		"activity tracking",
		"retention",
		"analytics",
	],
};

/**
 * Discover Page
 * Public marketing page with smart detection for Whop context
 *
 * Behavior:
 * - If user is in Whop iframe: Shows message to check sidebar
 * - If user is on public web: Shows full landing page with install buttons
 */
export default function DiscoverPage() {
	return (
		<>
			<LandingNavbar />
			<DiscoverClientUI />
		</>
	);
}
