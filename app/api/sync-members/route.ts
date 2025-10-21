/**
 * API Route: Sync Members from Whop to Supabase
 * POST /api/sync-members
 */

import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@whop-apps/sdk";
import { whopSdk } from "@/lib/whop-sdk";
import { syncMembersFromWhop, getSyncStats } from "@/lib/whop-sync";

// Rate limiting: Store last sync time per company
const lastSyncTimes = new Map<string, number>();
const RATE_LIMIT_MS = 60 * 1000; // 1 minute

/**
 * POST handler - Trigger member sync
 */
export async function POST(request: NextRequest) {
	try {
		// Parse request body
		const body = await request.json().catch(() => ({}));
		const companyId =
			body.companyId ||
			request.nextUrl.searchParams.get("companyId") ||
			process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

		if (!companyId) {
			return NextResponse.json(
				{ error: "Missing companyId parameter" },
				{ status: 400 }
			);
		}

		console.log(`[API] Sync request for company: ${companyId}`);

		// Rate limiting check
		const now = Date.now();
		const lastSync = lastSyncTimes.get(companyId);

		if (lastSync && now - lastSync < RATE_LIMIT_MS) {
			const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastSync)) / 1000);
			return NextResponse.json(
				{
					error: "Rate limit exceeded",
					message: `Please wait ${waitTime} seconds before syncing again`,
					retry_after: waitTime,
				},
				{ status: 429 }
			);
		}

		// Validate Whop authentication using @whop-apps/sdk
		const headers = request.headers;
		let userId: string;

		try {
			const { userId: validatedUserId } = await validateToken({ headers });

			if (!validatedUserId) {
				throw new Error('No userId returned from validateToken');
			}

			userId = validatedUserId;
		} catch (authError: any) {
			console.error("[API Sync] Authentication failed:", authError?.message);
			return NextResponse.json(
				{ error: "Authentication required", message: "Invalid or missing token" },
				{ status: 401 }
			);
		}

		// Check user has access to this company
		try {
			const accessResult = await whopSdk.access.checkIfUserHasAccessToCompany({
				userId,
				companyId,
			});

			if (!accessResult.hasAccess) {
				console.log(`[API] User ${userId} denied access to company ${companyId}`);
				return NextResponse.json(
					{ error: "Access denied", message: "You don't have access to this company" },
					{ status: 403 }
				);
			}

			console.log(`[API] Access granted for user ${userId}`);
		} catch (accessError) {
			console.error("[API] Access check failed:", accessError);
			return NextResponse.json(
				{ error: "Access check failed", message: "Could not verify company access" },
				{ status: 403 }
			);
		}

		// Perform the sync
		console.log(`[API] Starting sync for company: ${companyId}`);
		const startTime = Date.now();

		const result = await syncMembersFromWhop(companyId);

		const duration = Date.now() - startTime;
		console.log(`[API] Sync completed in ${duration}ms`);

		// Update rate limit tracker
		lastSyncTimes.set(companyId, Date.now());

		// Get updated stats
		const stats = await getSyncStats(companyId);

		// Return success response
		return NextResponse.json({
			success: result.success,
			message: result.success
				? `Successfully synced ${result.count} members`
				: "Sync failed - check errors",
			data: {
				synced_count: result.count,
				skipped_count: result.skipped,
				duration_ms: duration,
				stats,
				errors: result.errors.length > 0 ? result.errors : undefined,
			},
		});
	} catch (error: any) {
		console.error("[API] Unexpected error:", error);

		return NextResponse.json(
			{
				error: "Internal server error",
				message: error.message || "An unexpected error occurred",
				details: process.env.NODE_ENV === "development" ? error : undefined,
			},
			{ status: 500 }
		);
	}
}

/**
 * GET handler - Get sync stats without triggering sync
 */
export async function GET(request: NextRequest) {
	try {
		const companyId =
			request.nextUrl.searchParams.get("companyId") ||
			process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

		if (!companyId) {
			return NextResponse.json(
				{ error: "Missing companyId parameter" },
				{ status: 400 }
			);
		}

		// Get stats
		const stats = await getSyncStats(companyId);

		// Check if rate limit is active
		const lastSync = lastSyncTimes.get(companyId);
		const canSyncNow = !lastSync || Date.now() - lastSync >= RATE_LIMIT_MS;

		return NextResponse.json({
			success: true,
			data: {
				stats,
				can_sync: canSyncNow,
				last_synced: stats.last_synced,
			},
		});
	} catch (error: any) {
		console.error("[API] Error getting stats:", error);

		return NextResponse.json(
			{
				error: "Failed to get stats",
				message: error.message,
			},
			{ status: 500 }
		);
	}
}
