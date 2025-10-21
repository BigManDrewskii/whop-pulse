/**
 * User Activity Tracker
 * Tracks user visits and activity for analytics
 */

import { createClient } from "@supabase/supabase-js";
import { trackEvent } from "./analytics";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Track user dashboard visit
 */
export async function trackUserActivity(
	userId: string,
	companyId: string,
	activityType: "dashboard_visit" | "settings_visit" | "help_visit" | "sync_action"
): Promise<void> {
	try {
		// Track in analytics
		trackEvent("page_loaded", {
			user_id: userId,
			company_id: companyId,
			activity_type: activityType,
			timestamp: new Date().toISOString(),
		});

		// Update last_login in member_activity if they're a member
		const { error } = await supabase
			.from("member_activity")
			.update({
				last_login: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("company_id", companyId)
			.eq("member_id", userId);

		if (error) {
			console.warn("[Activity] Could not update member activity:", error);
			// Don't throw - this is non-critical
		}

		console.log(`[Activity] Tracked ${activityType} for user ${userId}`);
	} catch (error) {
		console.error("[Activity] Error tracking activity:", error);
		// Don't throw - activity tracking should never break the app
	}
}

/**
 * Get user's last activity
 */
export async function getUserLastActivity(
	userId: string,
	companyId: string
): Promise<{ last_login: string | null; last_active: string | null } | null> {
	try {
		const { data, error } = await supabase
			.from("member_activity")
			.select("last_login, last_active")
			.eq("company_id", companyId)
			.eq("member_id", userId)
			.single();

		if (error) {
			console.warn("[Activity] Could not fetch user activity:", error);
			return null;
		}

		return data;
	} catch (error) {
		console.error("[Activity] Error fetching activity:", error);
		return null;
	}
}
