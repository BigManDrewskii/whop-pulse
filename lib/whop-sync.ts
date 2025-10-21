/**
 * Whop-to-Supabase Member Sync Utility
 * Syncs member data from Whop API to Supabase database with engagement scoring
 */

import { whopSdk } from "./whop-sdk";
import { createClient } from "@supabase/supabase-js";

// Use service role key for server-side writes (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

/**
 * Member data structure matching Supabase schema
 */
export interface MemberData {
	company_id: string;
	member_id: string;
	member_email: string | null;
	member_username: string | null;
	member_name: string | null;
	last_active: string | null;
	status: "active" | "at_risk" | "inactive";
	activity_score: number;
	total_sessions: number;
	last_login: string | null;
	days_since_active: number;
}

/**
 * Calculate engagement score based on days since last active
 * @param daysSinceActive - Number of days since member was last active
 * @returns Score from 0-100 and status
 */
export function calculateEngagementScore(daysSinceActive: number): {
	score: number;
	status: "active" | "at_risk" | "inactive";
} {
	// Formula: max(0, 100 - (days * 3))
	const score = Math.max(0, 100 - daysSinceActive * 3);

	// Determine status based on score/days
	let status: "active" | "at_risk" | "inactive";
	if (daysSinceActive <= 7) {
		status = "active";
	} else if (daysSinceActive <= 30) {
		status = "at_risk";
	} else {
		status = "inactive";
	}

	return {
		score: Math.round(score),
		status,
	};
}

/**
 * Calculate days since a given date
 */
function getDaysSince(dateString: string | null | undefined): number {
	if (!dateString) return 999; // Default to very old if no date

	try {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	} catch (error) {
		console.error("Error parsing date:", dateString, error);
		return 999;
	}
}

/**
 * Transform Whop member data to our schema
 */
function transformWhopMember(
	member: any,
	companyId: string
): MemberData | null {
	try {
		// Extract last active date (try multiple possible fields)
		const lastActive =
			member.last_active_at ||
			member.access_pass?.last_accessed_at ||
			member.created_at ||
			member.valid_from ||
			null;

		const daysSinceActive = getDaysSince(lastActive);
		const { score, status } = calculateEngagementScore(daysSinceActive);

		// Get member info (handle different API response structures)
		const userId = member.id || member.user_id || member.member_id;
		const email = member.email || member.user?.email || null;
		const username =
			member.username || member.user?.username || member.discord_username || null;
		const name =
			member.name ||
			member.user?.name ||
			member.full_name ||
			username ||
			email?.split("@")[0] ||
			`User ${userId}`;

		// Get login info
		const lastLogin = member.last_login_at || lastActive;
		const totalSessions = member.total_sessions || member.login_count || 0;

		return {
			company_id: companyId,
			member_id: userId,
			member_email: email,
			member_username: username,
			member_name: name,
			last_active: lastActive,
			status,
			activity_score: score,
			total_sessions: totalSessions,
			last_login: lastLogin,
			days_since_active: daysSinceActive,
		};
	} catch (error) {
		console.error("Error transforming member:", member, error);
		return null;
	}
}

/**
 * Sync members from Whop API to Supabase
 * @param companyId - Whop company ID (biz_*)
 * @returns Sync results
 */
export async function syncMembersFromWhop(companyId: string): Promise<{
	success: boolean;
	count: number;
	errors: any[];
	skipped: number;
}> {
	const errors: any[] = [];
	let memberCount = 0;
	let skipped = 0;

	try {
		console.log(`[Whop Sync] Starting sync for company: ${companyId}`);

		// Fetch members from Whop API
		console.log("[Whop Sync] Fetching members from Whop API...");

		let whopMembers: any[] = [];

		try {
			// TODO: Fetch memberships from Whop API
			// The Whop SDK structure varies - you'll need to adjust this based on the actual API
			// Possible approaches:
			// 1. Check Whop API docs for the correct endpoint
			// 2. Use fetch() directly with Whop API key
			// 3. Use whopSdk.withCompany(companyId).someMethod()
			//
			// Example with direct fetch:
			// const response = await fetch(`https://api.whop.com/v5/companies/${companyId}/memberships`, {
			//   headers: { 'Authorization': `Bearer ${process.env.WHOP_API_KEY}` }
			// });
			// whopMembers = await response.json();

			console.warn(
				"[Whop Sync] Whop API integration not yet configured - using empty dataset"
			);
			console.warn(
				"[Whop Sync] Update lib/whop-sync.ts line ~165 with actual Whop API call"
			);

			// For now, return empty to prevent errors
			// Once you have the actual API working, remove this warning
			whopMembers = [];
		} catch (whopError: any) {
			console.error("[Whop Sync] Error fetching from Whop API:", whopError);
			errors.push({
				type: "whop_api_error",
				message: whopError.message,
				details: whopError,
			});

			// If we can't fetch from Whop, return early
			return {
				success: false,
				count: 0,
				errors,
				skipped: 0,
			};
		}

		// Handle empty response
		if (!whopMembers || whopMembers.length === 0) {
			console.log("[Whop Sync] No members found in Whop");
			return {
				success: true,
				count: 0,
				errors: [],
				skipped: 0,
			};
		}

		// Transform members to our schema
		console.log("[Whop Sync] Transforming member data...");
		const transformedMembers: MemberData[] = [];

		for (const member of whopMembers) {
			const transformed = transformWhopMember(member, companyId);
			if (transformed) {
				transformedMembers.push(transformed);
			} else {
				skipped++;
			}
		}

		console.log(
			`[Whop Sync] Transformed ${transformedMembers.length} members (${skipped} skipped)`
		);

		// Upsert to Supabase
		if (transformedMembers.length > 0) {
			console.log("[Whop Sync] Upserting to Supabase...");

			const { data, error: upsertError } = await supabase
				.from("member_activity")
				.upsert(transformedMembers, {
					onConflict: "company_id,member_id",
					ignoreDuplicates: false, // Update existing records
				})
				.select();

			if (upsertError) {
				console.error("[Whop Sync] Supabase upsert error:", upsertError);
				errors.push({
					type: "supabase_upsert_error",
					message: upsertError.message,
					details: upsertError,
				});
				return {
					success: false,
					count: 0,
					errors,
					skipped,
				};
			}

			memberCount = data?.length || transformedMembers.length;
			console.log(`[Whop Sync] Successfully synced ${memberCount} members`);
		}

		return {
			success: true,
			count: memberCount,
			errors,
			skipped,
		};
	} catch (error: any) {
		console.error("[Whop Sync] Unexpected error during sync:", error);
		errors.push({
			type: "unexpected_error",
			message: error.message,
			details: error,
		});

		return {
			success: false,
			count: memberCount,
			errors,
			skipped,
		};
	}
}

/**
 * Get sync statistics
 */
export async function getSyncStats(companyId: string): Promise<{
	total: number;
	active: number;
	at_risk: number;
	inactive: number;
	last_synced: string | null;
}> {
	try {
		const { data, error } = await supabase
			.from("member_activity")
			.select("status, updated_at")
			.eq("company_id", companyId);

		if (error) {
			throw error;
		}

		const stats = {
			total: data?.length || 0,
			active: data?.filter((m) => m.status === "active").length || 0,
			at_risk: data?.filter((m) => m.status === "at_risk").length || 0,
			inactive: data?.filter((m) => m.status === "inactive").length || 0,
			last_synced:
				data && data.length > 0
					? data.sort(
							(a, b) =>
								new Date(b.updated_at).getTime() -
								new Date(a.updated_at).getTime()
						)[0].updated_at
					: null,
		};

		return stats;
	} catch (error) {
		console.error("[Whop Sync] Error getting stats:", error);
		return {
			total: 0,
			active: 0,
			at_risk: 0,
			inactive: 0,
			last_synced: null,
		};
	}
}
