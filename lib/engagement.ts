/**
 * Engagement Score Calculation
 * Calculates member engagement based on last activity timestamp
 */

import type { EngagementScore, EngagementStatus } from "./types";

/**
 * Calculate engagement score from last active timestamp
 *
 * Algorithm:
 * - 0-7 days since active:  Active status, score 80-100
 *   - 0 days = 100 (active today)
 *   - 7 days = 80 (linear decay)
 *
 * - 8-30 days since active: At Risk status, score 40-79
 *   - 8 days = 79
 *   - 30 days = 40 (linear decay)
 *
 * - 30+ days since active:  Inactive status, score 0-39
 *   - 31 days = 39
 *   - 60+ days = 0 (linear decay, floor at 0)
 *
 * @param lastActiveAt - ISO timestamp string of last activity, or null/undefined
 * @returns EngagementScore object with score, status, and days since active
 */
export function calculateEngagementScore(
	lastActiveAt: string | null | undefined
): EngagementScore {
	// Handle null/undefined - treat as never active
	if (!lastActiveAt) {
		return {
			score: 0,
			status: "inactive",
			daysSinceActive: Number.MAX_SAFE_INTEGER,
		};
	}

	// Calculate days since last active
	const lastActiveDate = new Date(lastActiveAt);
	const now = new Date();
	const diffMs = now.getTime() - lastActiveDate.getTime();
	const daysSinceActive = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	// Calculate score and status based on days
	let score: number;
	let status: EngagementStatus;

	if (daysSinceActive <= 7) {
		// ACTIVE: 0-7 days
		// Linear decay from 100 (day 0) to 80 (day 7)
		// Formula: 100 - (days * 2.857)
		score = Math.round(100 - daysSinceActive * (20 / 7));
		status = "active";
	} else if (daysSinceActive <= 30) {
		// AT RISK: 8-30 days
		// Linear decay from 79 (day 8) to 40 (day 30)
		// Formula: 79 - ((days - 8) * 1.696)
		const daysInRange = daysSinceActive - 8;
		score = Math.round(79 - daysInRange * (39 / 22));
		status = "at_risk";
	} else {
		// INACTIVE: 30+ days
		// Linear decay from 39 (day 31) to 0 (day 60+)
		// Formula: 39 - ((days - 31) * 1.3)
		const daysInRange = daysSinceActive - 31;
		score = Math.max(0, Math.round(39 - daysInRange * (39 / 29)));
		status = "inactive";
	}

	return {
		score,
		status,
		daysSinceActive,
	};
}

/**
 * Batch calculate engagement scores for multiple members
 *
 * @param members - Array of objects with last_active_at timestamp
 * @returns Array of EngagementScore objects
 */
export function calculateEngagementScores(
	members: Array<{ last_active_at?: string | null }>
): EngagementScore[] {
	return members.map((member) =>
		calculateEngagementScore(member.last_active_at)
	);
}

/**
 * Get engagement status from score
 * Useful when you have a score but need to determine status
 *
 * @param score - Activity score (0-100)
 * @returns EngagementStatus
 */
export function getStatusFromScore(score: number): EngagementStatus {
	if (score >= 80) return "active";
	if (score >= 40) return "at_risk";
	return "inactive";
}

/**
 * Format days since active into human-readable string
 *
 * @param days - Number of days since last active
 * @returns Human-readable string (e.g., "2 days ago", "1 month ago")
 */
export function formatDaysSinceActive(days: number): string {
	if (days === 0) return "Active today";
	if (days === 1) return "1 day ago";
	if (days < 7) return `${days} days ago`;
	if (days < 30) {
		const weeks = Math.floor(days / 7);
		return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
	}
	if (days < 60) {
		const months = Math.floor(days / 30);
		return months === 1 ? "1 month ago" : `${months} months ago`;
	}
	return "Over 2 months ago";
}
