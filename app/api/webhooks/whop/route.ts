/**
 * Whop Webhook Handler
 * Handles real-time member updates from Whop
 *
 * Events handled:
 * - membership.went_valid (new member)
 * - membership.accessed (login/activity)
 * - membership.went_invalid (expired/cancelled)
 */

import { NextRequest, NextResponse } from "next/server";
import { makeWebhookValidator } from "@whop/api";
import { createClient } from "@supabase/supabase-js";
import { calculateEngagementScore } from "@/lib/whop-sync";

// Use service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

// Initialize webhook validator
const validateWebhook = makeWebhookValidator({
	webhookSecret: process.env.WHOP_WEBHOOK_SECRET || "dev_fallback_secret_change_in_production",
});

/**
 * Calculate days since a date
 */
function getDaysSince(dateString: string | null | undefined): number {
	if (!dateString) return 0;

	try {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	} catch (error) {
		return 0;
	}
}

/**
 * Handle membership.went_valid event (new member joined)
 */
async function handleMembershipWentValid(event: any) {
	try {
		console.log("[Webhook] Handling membership.went_valid event");

		const membership = event.data;
		const memberId = membership.user_id || membership.id;
		const companyId = membership.company_id || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

		if (!memberId || !companyId) {
			console.error("[Webhook] Missing member ID or company ID");
			return;
		}

		// New members get max engagement score
		const { score, status } = calculateEngagementScore(0);

		const memberData = {
			company_id: companyId,
			member_id: memberId,
			member_email: membership.email || membership.user?.email || null,
			member_username: membership.username || membership.user?.username || null,
			member_name:
				membership.name ||
				membership.user?.name ||
				membership.username ||
				`User ${memberId}`,
			last_active: new Date().toISOString(),
			status,
			activity_score: score,
			total_sessions: 1,
			last_login: new Date().toISOString(),
			days_since_active: 0,
		};

		// Upsert to database
		const { error } = await supabase
			.from("member_activity")
			.upsert(memberData, {
				onConflict: "company_id,member_id",
			});

		if (error) {
			console.error("[Webhook] Error upserting new member:", error);
		} else {
			console.log(`[Webhook] New member added: ${memberId}`);
		}
	} catch (error) {
		console.error("[Webhook] Error in handleMembershipWentValid:", error);
	}
}

/**
 * Handle membership.accessed event (member logged in/accessed)
 */
async function handleMembershipAccessed(event: any) {
	try {
		console.log("[Webhook] Handling membership.accessed event");

		const membership = event.data;
		const memberId = membership.user_id || membership.id;
		const companyId = membership.company_id || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

		if (!memberId || !companyId) {
			console.error("[Webhook] Missing member ID or company ID");
			return;
		}

		// Get current member data
		const { data: currentMember } = await supabase
			.from("member_activity")
			.select("*")
			.eq("company_id", companyId)
			.eq("member_id", memberId)
			.single();

		// Calculate new engagement score (0 days since active)
		const { score, status } = calculateEngagementScore(0);

		const updates: any = {
			last_active: new Date().toISOString(),
			activity_score: score,
			status,
			days_since_active: 0,
			last_login: new Date().toISOString(),
			total_sessions: (currentMember?.total_sessions || 0) + 1,
		};

		// Update existing or insert new
		const { error } = await supabase
			.from("member_activity")
			.upsert(
				{
					company_id: companyId,
					member_id: memberId,
					member_email: membership.email || currentMember?.member_email || null,
					member_username:
						membership.username || currentMember?.member_username || null,
					member_name:
						membership.name || currentMember?.member_name || `User ${memberId}`,
					...updates,
				},
				{
					onConflict: "company_id,member_id",
				}
			);

		if (error) {
			console.error("[Webhook] Error updating member access:", error);
		} else {
			console.log(`[Webhook] Member activity updated: ${memberId} (score: ${score})`);
		}
	} catch (error) {
		console.error("[Webhook] Error in handleMembershipAccessed:", error);
	}
}

/**
 * Handle membership.went_invalid event (member expired/cancelled)
 */
async function handleMembershipWentInvalid(event: any) {
	try {
		console.log("[Webhook] Handling membership.went_invalid event");

		const membership = event.data;
		const memberId = membership.user_id || membership.id;
		const companyId = membership.company_id || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

		if (!memberId || !companyId) {
			console.error("[Webhook] Missing member ID or company ID");
			return;
		}

		// Mark as inactive with 0 score
		const updates = {
			status: "inactive" as const,
			activity_score: 0,
			days_since_active: 999, // Very old
		};

		// Update member (keep historical record, don't delete)
		const { error } = await supabase
			.from("member_activity")
			.update(updates)
			.eq("company_id", companyId)
			.eq("member_id", memberId);

		if (error) {
			console.error("[Webhook] Error marking member inactive:", error);
		} else {
			console.log(`[Webhook] Member marked inactive: ${memberId}`);
		}
	} catch (error) {
		console.error("[Webhook] Error in handleMembershipWentInvalid:", error);
	}
}

/**
 * POST handler - Receive and process Whop webhooks
 */
export async function POST(request: NextRequest): Promise<Response> {
	const startTime = Date.now();

	try {
		// Validate webhook signature
		let webhookData: any;
		try {
			webhookData = await validateWebhook(request);
			console.log(`[Webhook] Validated webhook: ${webhookData.action}`);
		} catch (validationError: any) {
			console.error("[Webhook] Signature validation failed:", validationError);

			// Always return 200 to avoid retry storms
			return NextResponse.json(
				{
					received: true,
					error: "Invalid signature",
				},
				{ status: 200 }
			);
		}

		// Extract event type and data
		const eventType = webhookData.action;
		const eventData = webhookData;

		console.log(`[Webhook] Processing event: ${eventType}`);

		// Route to appropriate handler
		switch (eventType) {
			case "membership.went_valid":
				await handleMembershipWentValid(eventData);
				break;

			case "membership.accessed":
				await handleMembershipAccessed(eventData);
				break;

			case "membership.went_invalid":
				await handleMembershipWentInvalid(eventData);
				break;

			default:
				console.log(`[Webhook] Unhandled event type: ${eventType}`);
		}

		const duration = Date.now() - startTime;
		console.log(`[Webhook] Processed in ${duration}ms`);

		// Always return 200 OK
		return NextResponse.json({
			received: true,
			event: eventType,
			duration_ms: duration,
		});
	} catch (error: any) {
		console.error("[Webhook] Unexpected error:", error);

		// Log error but still return 200 to prevent retries
		const duration = Date.now() - startTime;

		// TODO: Store failed webhooks in database for debugging
		// await supabase.from('webhook_failures').insert({
		//   event_type: eventType,
		//   error: error.message,
		//   payload: JSON.stringify(request.body)
		// });

		return NextResponse.json({
			received: true,
			error: "Internal error",
			duration_ms: duration,
		});
	}
}

/**
 * GET handler - Health check
 */
export async function GET() {
	return NextResponse.json({
		status: "ok",
		webhook_endpoint: "/api/webhooks/whop",
		supported_events: [
			"membership.went_valid",
			"membership.accessed",
			"membership.went_invalid",
		],
	});
}
