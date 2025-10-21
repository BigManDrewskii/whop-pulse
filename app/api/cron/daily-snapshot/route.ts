/**
 * Daily Snapshot Cron Job
 * Creates daily snapshots of member engagement scores
 *
 * Trigger manually:
 * curl -X GET https://your-app.vercel.app/api/cron/daily-snapshot?secret=YOUR_CRON_SECRET
 *
 * Or configure Vercel Cron in vercel.json
 */

import { NextRequest, NextResponse } from "next/server";
import { createDailySnapshot } from "@/lib/create-snapshot";

/**
 * GET handler - Create daily snapshot for all companies
 */
export async function GET(request: NextRequest) {
	const startTime = Date.now();

	try {
		// Verify cron secret for security
		const secret = request.nextUrl.searchParams.get("secret");
		const expectedSecret = process.env.CRON_SECRET || "dev_cron_secret";

		if (secret !== expectedSecret) {
			console.error("[Cron] Invalid secret provided");
			return NextResponse.json(
				{ error: "Unauthorized", message: "Invalid cron secret" },
				{ status: 401 }
			);
		}

		console.log("[Cron] Daily snapshot job started");

		// Get company ID (for single-company setup)
		const companyId =
			request.nextUrl.searchParams.get("companyId") ||
			process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

		if (!companyId) {
			return NextResponse.json(
				{
					error: "Missing companyId",
					message: "No company ID provided or configured",
				},
				{ status: 400 }
			);
		}

		// Create snapshot
		const result = await createDailySnapshot(companyId);

		const duration = Date.now() - startTime;

		if (result.success) {
			console.log(
				`[Cron] Snapshot created successfully: ${result.count} members in ${duration}ms`
			);

			return NextResponse.json({
				success: true,
				message: `Created ${result.count} snapshots`,
				data: {
					company_id: companyId,
					snapshot_count: result.count,
					duration_ms: duration,
					timestamp: new Date().toISOString(),
				},
			});
		} else {
			console.error("[Cron] Snapshot failed:", result.errors);

			return NextResponse.json(
				{
					success: false,
					message: "Snapshot creation failed",
					errors: result.errors,
				},
				{ status: 500 }
			);
		}
	} catch (error: any) {
		const duration = Date.now() - startTime;
		console.error("[Cron] Unexpected error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: error.message,
				duration_ms: duration,
			},
			{ status: 500 }
		);
	}
}

/**
 * POST handler - Manual trigger (alternative to GET with secret)
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}));
		const secret = body.secret;
		const expectedSecret = process.env.CRON_SECRET || "dev_cron_secret";

		if (secret !== expectedSecret) {
			return NextResponse.json(
				{ error: "Unauthorized", message: "Invalid cron secret" },
				{ status: 401 }
			);
		}

		const companyId =
			body.companyId || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

		if (!companyId) {
			return NextResponse.json(
				{ error: "Missing companyId" },
				{ status: 400 }
			);
		}

		const result = await createDailySnapshot(companyId);

		if (result.success) {
			return NextResponse.json({
				success: true,
				message: `Created ${result.count} snapshots`,
				data: {
					company_id: companyId,
					snapshot_count: result.count,
				},
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					message: "Snapshot creation failed",
					errors: result.errors,
				},
				{ status: 500 }
			);
		}
	} catch (error: any) {
		return NextResponse.json(
			{
				success: false,
				error: error.message,
			},
			{ status: 500 }
		);
	}
}
