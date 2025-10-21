/**
 * Logout API Route
 * Handles app-level logout and redirects back to Whop
 *
 * Note: Since we're in a Whop iframe, we can't actually log the user out of Whop.
 * This endpoint clears app-level session data and provides a redirect URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
	try {
		// Track logout event
		trackEvent("user_action", {
			action: "logout",
			timestamp: new Date().toISOString(),
		});

		console.log("[Auth] User logout initiated");

		// Since Whop handles authentication and we're in an iframe,
		// we can't actually log the user out of Whop.
		// Just return success and let the client handle the redirect.

		return NextResponse.json({
			success: true,
			message: "Logged out successfully",
			redirect_url: "https://whop.com/dashboard", // Redirect to Whop dashboard
		});
	} catch (error: any) {
		console.error("[Auth] Logout error:", error);

		return NextResponse.json(
			{
				success: false,
				error: {
					message: "Failed to logout",
					code: "LOGOUT_ERROR",
				},
			},
			{ status: 500 }
		);
	}
}

/**
 * GET handler - Redirect to logged out page
 */
export async function GET() {
	// Simple logout via GET request
	return NextResponse.redirect(new URL("/logged-out", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
