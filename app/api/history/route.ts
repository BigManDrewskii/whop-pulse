/**
 * Historical Data API
 * Returns historical engagement data for charts
 *
 * GET /api/history?companyId=biz_xxx&days=30
 */

import { NextRequest, NextResponse } from "next/server";
import { getHistoricalData } from "@/lib/create-snapshot";

export async function GET(request: NextRequest) {
	try {
		const companyId =
			request.nextUrl.searchParams.get("companyId") ||
			process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

		const daysParam = request.nextUrl.searchParams.get("days");
		const days = daysParam ? parseInt(daysParam, 10) : 30;

		if (!companyId) {
			return NextResponse.json(
				{ error: "Missing companyId parameter" },
				{ status: 400 }
			);
		}

		// Validate days parameter
		if (days < 1 || days > 90) {
			return NextResponse.json(
				{ error: "Days must be between 1 and 90" },
				{ status: 400 }
			);
		}

		// Fetch historical data
		const data = await getHistoricalData(companyId, days);

		return NextResponse.json({
			success: true,
			data,
			meta: {
				company_id: companyId,
				days_requested: days,
				data_points: data.length,
				using_mock: data.length === 0,
			},
		});
	} catch (error: any) {
		console.error("[History API] Error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch historical data",
				message: error.message,
				data: [], // Return empty array for graceful fallback
			},
			{ status: 500 }
		);
	}
}
