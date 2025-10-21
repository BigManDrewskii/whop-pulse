/**
 * Health Check Endpoint
 * Verifies connectivity to all external services
 *
 * GET /api/health
 * GET /api/health?service=supabase
 * GET /api/health?service=whop
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { whopSdk } from "@/lib/whop-sdk";

interface ServiceStatus {
	healthy: boolean;
	latency_ms: number;
	error?: string;
}

/**
 * Check Supabase connection
 */
async function checkSupabase(): Promise<ServiceStatus> {
	const startTime = Date.now();

	try {
		// Simple query to test connection
		const { error } = await supabase
			.from("member_activity")
			.select("id")
			.limit(1);

		const latency = Date.now() - startTime;

		if (error) {
			return {
				healthy: false,
				latency_ms: latency,
				error: error.message,
			};
		}

		return {
			healthy: true,
			latency_ms: latency,
		};
	} catch (error: any) {
		return {
			healthy: false,
			latency_ms: Date.now() - startTime,
			error: error.message || "Connection failed",
		};
	}
}

/**
 * Check Whop SDK configuration (lightweight check)
 */
async function checkWhop(): Promise<ServiceStatus> {
	const startTime = Date.now();

	try {
		// Check if SDK is properly configured
		const hasApiKey = !!process.env.WHOP_API_KEY;
		const hasAppId = !!process.env.NEXT_PUBLIC_WHOP_APP_ID;
		const hasCompanyId = !!process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

		const latency = Date.now() - startTime;

		if (!hasApiKey || !hasAppId) {
			return {
				healthy: false,
				latency_ms: latency,
				error: "Whop SDK not configured (missing credentials)",
			};
		}

		// SDK is configured - assume healthy
		// Don't make actual API calls in health check (requires auth context)
		return {
			healthy: true,
			latency_ms: latency,
		};
	} catch (error: any) {
		return {
			healthy: false,
			latency_ms: Date.now() - startTime,
			error: error.message || "Configuration check failed",
		};
	}
}

/**
 * GET handler - Health check
 */
export async function GET(request: NextRequest) {
	const service = request.nextUrl.searchParams.get("service");

	try {
		// Check specific service
		if (service === "supabase") {
			const status = await checkSupabase();
			return NextResponse.json({
				service: "supabase",
				...status,
				timestamp: new Date().toISOString(),
			});
		}

		if (service === "whop") {
			const status = await checkWhop();
			return NextResponse.json({
				service: "whop",
				...status,
				timestamp: new Date().toISOString(),
			});
		}

		// Check all services
		const [supabaseStatus, whopStatus] = await Promise.all([
			checkSupabase(),
			checkWhop(),
		]);

		const allHealthy = supabaseStatus.healthy && whopStatus.healthy;

		return NextResponse.json(
			{
				healthy: allHealthy,
				services: {
					supabase: supabaseStatus,
					whop: whopStatus,
				},
				timestamp: new Date().toISOString(),
				environment: process.env.NODE_ENV || "unknown",
			},
			{ status: allHealthy ? 200 : 503 }
		);
	} catch (error: any) {
		console.error("[Health] Unexpected error:", error);

		return NextResponse.json(
			{
				healthy: false,
				error: error.message,
				timestamp: new Date().toISOString(),
			},
			{ status: 503 }
		);
	}
}
