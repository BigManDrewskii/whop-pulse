/**
 * TypeScript Type Definitions for Whop Pulse
 */

/**
 * Engagement status categories
 */
export type EngagementStatus = "active" | "at_risk" | "inactive";

/**
 * Member activity record from database
 */
export interface MemberActivity {
	id: string;
	company_id: string;
	member_id: string;
	member_email: string | null;
	member_username: string | null;
	member_name: string | null;
	last_active: string | null; // TIMESTAMPTZ as ISO string
	status: EngagementStatus;
	activity_score: number; // 0-100
	total_sessions: number;
	last_login: string | null; // TIMESTAMPTZ as ISO string
	days_since_active: number;
	created_at: string; // TIMESTAMPTZ as ISO string
	updated_at: string; // TIMESTAMPTZ as ISO string
}

/**
 * Member type for API responses
 */
export interface Member {
	id: string;
	email?: string;
	username?: string;
	name?: string;
	last_active_at?: string; // ISO timestamp
	created_at?: string;
}

/**
 * Activity summary for a company
 */
export interface ActivitySummary {
	company_id: string;
	total_members: number;
	active_members: number;
	at_risk_members: number;
	inactive_members: number;
	avg_activity_score: number;
	last_updated: string;
}

/**
 * Engagement score result
 */
export interface EngagementScore {
	score: number; // 0-100
	status: EngagementStatus;
	daysSinceActive: number;
}

/**
 * Supabase Database Schema
 * Generated types for type-safe database queries
 */
export interface Database {
	public: {
		Tables: {
			member_activity: {
				Row: MemberActivity;
				Insert: Omit<MemberActivity, "id" | "created_at" | "updated_at"> & {
					id?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Omit<MemberActivity, "id" | "created_at">>;
			};
		};
		Views: {
			member_activity_summary: {
				Row: ActivitySummary;
			};
		};
	};
}
