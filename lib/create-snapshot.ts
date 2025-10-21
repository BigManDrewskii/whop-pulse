/**
 * Member History Snapshot Utilities
 * Creates daily snapshots of member engagement for historical trend analysis
 */

import { createClient } from "@supabase/supabase-js";

// Use service role for snapshot operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

export interface HistoricalDataPoint {
	date: string;
	avg_score: number;
	total_members: number;
	active_count: number;
	at_risk_count: number;
	inactive_count: number;
}

export interface ComparisonData {
	current: {
		total: number;
		active: number;
		at_risk: number;
		inactive: number;
		avg_score: number;
	};
	previous: {
		total: number;
		active: number;
		at_risk: number;
		inactive: number;
		avg_score: number;
	};
	changes: {
		total: number;
		active: number;
		at_risk: number;
		inactive: number;
		avg_score: number;
	};
}

/**
 * Create a daily snapshot of all members' current engagement scores
 * @param companyId - Whop company ID
 * @returns Number of snapshots created
 */
export async function createDailySnapshot(
	companyId: string
): Promise<{
	success: boolean;
	count: number;
	errors: any[];
}> {
	const errors: any[] = [];

	try {
		console.log(`[Snapshot] Creating daily snapshot for company: ${companyId}`);

		// Fetch all current members
		const { data: members, error: fetchError } = await supabase
			.from("member_activity")
			.select("member_id, activity_score, status")
			.eq("company_id", companyId);

		if (fetchError) {
			console.error("[Snapshot] Error fetching members:", fetchError);
			errors.push(fetchError);
			return { success: false, count: 0, errors };
		}

		if (!members || members.length === 0) {
			console.log("[Snapshot] No members to snapshot");
			return { success: true, count: 0, errors: [] };
		}

		console.log(`[Snapshot] Creating snapshots for ${members.length} members`);

		// Check if snapshot already exists for today
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const { count: existingCount } = await supabase
			.from("member_history")
			.select("*", { count: "exact", head: true })
			.eq("company_id", companyId)
			.gte("recorded_at", today.toISOString());

		if (existingCount && existingCount > 0) {
			console.log(
				`[Snapshot] Snapshot already exists for today (${existingCount} records)`
			);
			return { success: true, count: existingCount, errors: [] };
		}

		// Create snapshot records
		const snapshots = members.map((member) => ({
			company_id: companyId,
			member_id: member.member_id,
			engagement_score: member.activity_score,
			status: member.status,
			recorded_at: new Date().toISOString(),
		}));

		// Insert snapshots
		const { data: inserted, error: insertError } = await supabase
			.from("member_history")
			.insert(snapshots)
			.select();

		if (insertError) {
			console.error("[Snapshot] Error inserting snapshots:", insertError);
			errors.push(insertError);
			return { success: false, count: 0, errors };
		}

		const count = inserted?.length || 0;
		console.log(`[Snapshot] Successfully created ${count} snapshots`);

		return { success: true, count, errors: [] };
	} catch (error: any) {
		console.error("[Snapshot] Unexpected error:", error);
		errors.push(error);
		return { success: false, count: 0, errors };
	}
}

/**
 * Get historical engagement data for charts
 * @param companyId - Whop company ID
 * @param days - Number of days to fetch (default 30)
 * @returns Array of daily data points
 */
export async function getHistoricalData(
	companyId: string,
	days: number = 30
): Promise<HistoricalDataPoint[]> {
	try {
		console.log(
			`[History] Fetching ${days} days of historical data for ${companyId}`
		);

		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);

		// Query the daily_engagement_trends view
		const { data, error } = await supabase
			.from("daily_engagement_trends")
			.select("*")
			.eq("company_id", companyId)
			.gte("date", cutoffDate.toISOString().split("T")[0])
			.order("date", { ascending: true });

		if (error) {
			console.error("[History] Error fetching historical data:", error);
			return [];
		}

		if (!data || data.length === 0) {
			console.log("[History] No historical data found");
			return [];
		}

		console.log(`[History] Found ${data.length} days of historical data`);

		// Transform to chart format
		return data.map((row: any) => ({
			date: new Date(row.date).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			}),
			avg_score: row.avg_score || 0,
			total_members: row.total_members || 0,
			active_count: row.active_count || 0,
			at_risk_count: row.at_risk_count || 0,
			inactive_count: row.inactive_count || 0,
		}));
	} catch (error) {
		console.error("[History] Unexpected error:", error);
		return [];
	}
}

/**
 * Get comparison data (current vs 7 days ago)
 * @param companyId - Whop company ID
 * @returns Comparison data with changes
 */
export async function getComparisonData(
	companyId: string
): Promise<ComparisonData | null> {
	try {
		console.log(`[Comparison] Fetching comparison data for ${companyId}`);

		// Get current stats from member_activity
		const { data: currentMembers, error: currentError } = await supabase
			.from("member_activity")
			.select("status, activity_score")
			.eq("company_id", companyId);

		if (currentError || !currentMembers) {
			console.error("[Comparison] Error fetching current data:", currentError);
			return null;
		}

		// Calculate current stats
		const current = {
			total: currentMembers.length,
			active: currentMembers.filter((m) => m.status === "active").length,
			at_risk: currentMembers.filter((m) => m.status === "at_risk").length,
			inactive: currentMembers.filter((m) => m.status === "inactive").length,
			avg_score:
				currentMembers.reduce((sum, m) => sum + m.activity_score, 0) /
					currentMembers.length || 0,
		};

		// Get stats from 7 days ago
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const { data: historicalData, error: histError } = await supabase
			.from("member_history")
			.select("status, engagement_score")
			.eq("company_id", companyId)
			.gte(
				"recorded_at",
				new Date(sevenDaysAgo.setHours(0, 0, 0, 0)).toISOString()
			)
			.lte(
				"recorded_at",
				new Date(sevenDaysAgo.setHours(23, 59, 59, 999)).toISOString()
			);

		// If no historical data, return current with no change
		if (histError || !historicalData || historicalData.length === 0) {
			console.log("[Comparison] No historical data for comparison");
			return {
				current,
				previous: current, // No change if no history
				changes: {
					total: 0,
					active: 0,
					at_risk: 0,
					inactive: 0,
					avg_score: 0,
				},
			};
		}

		// Calculate previous stats
		const previous = {
			total: historicalData.length,
			active: historicalData.filter((m) => m.status === "active").length,
			at_risk: historicalData.filter((m) => m.status === "at_risk").length,
			inactive: historicalData.filter((m) => m.status === "inactive").length,
			avg_score:
				historicalData.reduce((sum, m) => sum + m.engagement_score, 0) /
					historicalData.length || 0,
		};

		// Calculate changes
		const changes = {
			total: current.total - previous.total,
			active: current.active - previous.active,
			at_risk: current.at_risk - previous.at_risk,
			inactive: current.inactive - previous.inactive,
			avg_score: current.avg_score - previous.avg_score,
		};

		console.log("[Comparison] Comparison calculated successfully");

		return {
			current,
			previous,
			changes,
		};
	} catch (error) {
		console.error("[Comparison] Unexpected error:", error);
		return null;
	}
}

/**
 * Cleanup old snapshots (optional - keep last 90 days)
 * @param companyId - Whop company ID
 * @param daysToKeep - Number of days to retain (default 90)
 */
export async function cleanupOldSnapshots(
	companyId: string,
	daysToKeep: number = 90
): Promise<{ success: boolean; deleted: number }> {
	try {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

		const { count, error } = await supabase
			.from("member_history")
			.delete({ count: "exact" })
			.eq("company_id", companyId)
			.lt("recorded_at", cutoffDate.toISOString());

		if (error) {
			console.error("[Cleanup] Error deleting old snapshots:", error);
			return { success: false, deleted: 0 };
		}

		console.log(`[Cleanup] Deleted ${count || 0} old snapshots`);
		return { success: true, deleted: count || 0 };
	} catch (error) {
		console.error("[Cleanup] Unexpected error:", error);
		return { success: false, deleted: 0 };
	}
}
