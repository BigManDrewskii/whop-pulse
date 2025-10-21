import { validateToken } from "@whop-apps/sdk";
import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import type { MemberActivity } from "@/lib/types";
import { generateMockMembers } from "@/lib/mock-data";
import { DashboardClientUI, DashboardLoadingState } from "./client-ui";
import { ErrorBoundary, APIErrorDisplay } from "./error-boundary";
import { Suspense } from "react";
import { PageLoading } from "@/components/LoadingSpinner";
import { InitialSyncLoader } from "@/components/InitialSyncLoader";
import { syncMembersFromWhop } from "@/lib/whop-sync";
import { AuthError } from "@/components/AuthError";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dashboard - Pulse Member Activity Monitor",
	description:
		"Monitor member engagement, track activity scores, and identify at-risk members in real-time.",
};

// Force dynamic rendering for auth validation
export const dynamic = "force-dynamic";

// Cache data for 60 seconds to reduce database queries
export const revalidate = 60;

/**
 * Fetch members from Supabase database
 */
async function fetchMembersData(companyId: string): Promise<MemberActivity[]> {
	try {
		console.log("[Pulse] Fetching members for company:", companyId);

		// Query Supabase for members (limit to 1000 to prevent excessive data transfer)
		const { data, error } = await supabase
			.from("member_activity")
			.select("*")
			.eq("company_id", companyId)
			.order("activity_score", { ascending: false })
			.limit(1000)
			.returns<MemberActivity[]>();

		if (error) {
			console.error("[Pulse] Supabase query error:", error);
			throw new Error(`Failed to fetch members from database: ${error.message}`);
		}

		if (!data || data.length === 0) {
			console.warn("[Pulse] No members found for company:", companyId);
			return [];
		}

		console.log(`[Pulse] Successfully fetched ${data.length} members`);

		// Map database records to MemberActivity type
		const memberActivities: MemberActivity[] = data.map((record) => ({
			id: record.id,
			company_id: record.company_id,
			member_id: record.member_id,
			member_email: record.member_email,
			member_username: record.member_username,
			member_name: record.member_name,
			last_active: record.last_active,
			status: record.status as "active" | "at_risk" | "inactive",
			activity_score: record.activity_score,
			total_sessions: record.total_sessions || 0,
			last_login: record.last_login,
			days_since_active: record.days_since_active || 0,
			created_at: record.created_at,
			updated_at: record.updated_at,
		}));

		return memberActivities;
	} catch (error) {
		console.error("[Pulse] Error fetching members:", error);
		throw error;
	}
}

export default async function ExperiencePage({
	params,
	searchParams,
}: {
	params: Promise<{ companyId: string }>;
	searchParams: Promise<{ demo?: string }>;
}) {
	// Get headers, params, and search params
	const headersList = await headers();
	const { companyId } = await params;
	const { demo } = await searchParams;

	// Check if demo mode is enabled via URL parameter
	const isDemoMode = demo === "true";

	// Validate user token using @whop-apps/sdk
	let userId: string;
	try {
		const { userId: validatedUserId } = await validateToken({ headers: headersList });

		if (!validatedUserId) {
			throw new Error('No userId returned from validateToken');
		}

		userId = validatedUserId;
	} catch (error: any) {
		console.error("[Dashboard Page] Token validation failed:", error?.message);
		return (
			<AuthError
				type="invalid_token"
				message={error?.message}
			/>
		);
	}

	// Check user access to experience
	const accessResult = await whopSdk.access.checkIfUserHasAccessToCompany({
		userId,
		companyId,
	});

	// Redirect if no access
	if (!accessResult.hasAccess) {
		return <AuthError type="no_access" />;
	}

	// Get user data
	const user = await whopSdk.users.getUser({ userId });

	// Check if database is empty and trigger initial sync if needed
	let needsInitialSync = false;
	let syncResult: any = null;

	try {
		const { count, error: countError } = await supabase
			.from("member_activity")
			.select("*", { count: "exact", head: true })
			.eq("company_id", companyId);

		if (countError) {
			console.error("[Pulse] Error checking member count:", countError);
		} else if (count === 0) {
			console.log("[Pulse] Database is empty - triggering initial sync");
			needsInitialSync = true;

			// Perform initial sync (server-side, faster than API call)
			syncResult = await syncMembersFromWhop(companyId);

			if (syncResult.success) {
				console.log(
					`[Pulse] Initial sync completed: ${syncResult.count} members`
				);
			} else {
				console.error("[Pulse] Initial sync failed:", syncResult.errors);
			}
		}
	} catch (error) {
		console.error("[Pulse] Error during initial sync check:", error);
	}

	// Get company ID
	// Fetch members data with error handling (or use mock data if demo mode)
	let membersData: MemberActivity[];
	try {
		// Use mock data if demo mode is enabled, otherwise fetch real data
		if (isDemoMode) {
			console.log("[Pulse] Demo mode enabled - using mock data");
			membersData = generateMockMembers(companyId);
		} else {
			membersData = await fetchMembersData(companyId);
		}

		// If we just synced but still have no data, show error
		if (!isDemoMode && needsInitialSync && membersData.length === 0 && syncResult) {
			if (!syncResult.success) {
				return (
					<div className="min-h-screen flex items-center justify-center">
						<InitialSyncLoader
							status="error"
							error={
								syncResult.errors[0]?.message ||
								"Failed to sync member data from Whop"
							}
						/>
					</div>
				);
			} else {
				// Sync succeeded but no data - no members in Whop
				return (
					<div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
						<div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
							<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-10 h-10 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								No Members Yet
							</h2>
							<p className="text-gray-600">
								Your Whop community doesn't have any members yet. Members will
								appear here automatically once they join.
							</p>
						</div>
					</div>
				);
			}
		}
	} catch (error) {
		console.error("[Pulse] Failed to fetch members:", error);
		return (
			<APIErrorDisplay error="Unable to load member data. Please try refreshing the page." />
		);
	}

	return (
			<ErrorBoundary>
				<Suspense fallback={<PageLoading text="Loading member data..." />}>
					<DashboardClientUI
						members={membersData}
						companyId={companyId}
						userName={user.name || "User"}
						experienceId={companyId}
					/>
				</Suspense>
			</ErrorBoundary>
	);
}
