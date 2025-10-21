/**
 * Debug Endpoint - Environment Variables Check
 * Shows which environment variables are loaded (ONLY for debugging)
 *
 * IMPORTANT: Remove or protect this endpoint before production!
 */

import { NextResponse } from "next/server";

export async function GET() {
	// Check if we're in development mode
	const isDev = process.env.NODE_ENV === "development";

	// Only allow in development or with special debug token
	const debugToken = process.env.DEBUG_TOKEN || "debug123";

	// You can uncomment this to require authentication:
	// if (!isDev) {
	// 	return NextResponse.json({ error: "Not available in production" }, { status: 403 });
	// }

	return NextResponse.json({
		environment: process.env.NODE_ENV,
		timestamp: new Date().toISOString(),
		variables: {
			// Whop Configuration
			NEXT_PUBLIC_WHOP_APP_ID: process.env.NEXT_PUBLIC_WHOP_APP_ID || "NOT SET",
			NEXT_PUBLIC_WHOP_COMPANY_ID: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || "NOT SET",
			NEXT_PUBLIC_WHOP_CLIENT_ID: process.env.NEXT_PUBLIC_WHOP_CLIENT_ID || "NOT SET",
			NEXT_PUBLIC_WHOP_AGENT_USER_ID: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID || "NOT SET",

			// Check if secrets exist (don't show actual values)
			WHOP_API_KEY: process.env.WHOP_API_KEY ? `SET (${process.env.WHOP_API_KEY.length} chars)` : "NOT SET",
			WHOP_CLIENT_SECRET: process.env.WHOP_CLIENT_SECRET ? `SET (${process.env.WHOP_CLIENT_SECRET.length} chars)` : "NOT SET",
			NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? `SET (${process.env.NEXTAUTH_SECRET.length} chars)` : "NOT SET",

			// Supabase Configuration
			NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET",
			SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? `SET (${process.env.SUPABASE_ANON_KEY.length} chars)` : "NOT SET",

			// Other
			NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
		},
		validation: {
			// Check format validity
			appId_valid: process.env.NEXT_PUBLIC_WHOP_APP_ID?.startsWith("app_") || false,
			companyId_valid: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID?.startsWith("biz_") || false,
			clientId_valid: process.env.NEXT_PUBLIC_WHOP_CLIENT_ID?.startsWith("app_") || false,
			agentUserId_valid: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID?.startsWith("user_") || false,

			// Critical checks
			has_app_id: !!process.env.NEXT_PUBLIC_WHOP_APP_ID && process.env.NEXT_PUBLIC_WHOP_APP_ID !== "fallback",
			has_api_key: !!process.env.WHOP_API_KEY && process.env.WHOP_API_KEY !== "fallback",
			has_company_id: !!process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
			has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
		},
		warnings: getWarnings(),
	});
}

function getWarnings(): string[] {
	const warnings: string[] = [];

	if (!process.env.NEXT_PUBLIC_WHOP_APP_ID || process.env.NEXT_PUBLIC_WHOP_APP_ID === "fallback") {
		warnings.push("CRITICAL: NEXT_PUBLIC_WHOP_APP_ID is not set or using fallback value");
	}

	if (!process.env.WHOP_API_KEY || process.env.WHOP_API_KEY === "fallback") {
		warnings.push("CRITICAL: WHOP_API_KEY is not set or using fallback value");
	}

	if (!process.env.NEXT_PUBLIC_WHOP_APP_ID?.startsWith("app_")) {
		warnings.push("ERROR: NEXT_PUBLIC_WHOP_APP_ID must start with 'app_'");
	}

	if (!process.env.NEXT_PUBLIC_WHOP_COMPANY_ID?.startsWith("biz_")) {
		warnings.push("WARNING: NEXT_PUBLIC_WHOP_COMPANY_ID should start with 'biz_'");
	}

	if (!process.env.NEXT_PUBLIC_WHOP_CLIENT_ID?.startsWith("app_")) {
		warnings.push("WARNING: NEXT_PUBLIC_WHOP_CLIENT_ID should start with 'app_'");
	}

	if (!process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID?.startsWith("user_")) {
		warnings.push("INFO: NEXT_PUBLIC_WHOP_AGENT_USER_ID should start with 'user_' (optional)");
	}

	return warnings;
}
