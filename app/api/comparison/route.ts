/**
 * Comparison Data API
 * Returns week-over-week comparison data
 *
 * GET /api/comparison?companyId=biz_xxx
 */

import { NextRequest, NextResponse } from "next/server";
import { getComparisonData } from "@/lib/create-snapshot";

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

		// Fetch comparison data
		const data = await getComparisonData(companyId);

		if (!data) {
			return NextResponse.json({
				success: false,
				error: "Failed to calculate comparison",
				data: null,
			});
		}

		return NextResponse.json({
			success: true,
			data,
			meta: {
				company_id: companyId,
				has_historical_data: data.previous.total > 0,
			},
		});
	} catch (error: any) {
		console.error("[Comparison API] Error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch comparison data",
				message: error.message,
				data: null,
			},
			{ status: 500 }
		);
	}
}
