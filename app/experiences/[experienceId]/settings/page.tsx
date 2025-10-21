import { validateToken } from "@whop-apps/sdk";
import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import Link from "next/link";
import { SettingsClientUI } from "./client-ui";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Settings - Pulse Member Activity Monitor",
	description:
		"Configure engagement thresholds, notification preferences, and display options for your Pulse dashboard.",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function SettingsPage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	// Get headers and params
	const headersList = await headers();
	const { experienceId } = await params;

	// Validate user token using @whop-apps/sdk
	let userId: string;
	try {
		const { userId: validatedUserId } = await validateToken({ headers: headersList });

		if (!validatedUserId) {
			throw new Error('No userId returned from validateToken');
		}

		userId = validatedUserId;
	} catch (error) {
		console.error("Token validation failed:", error);
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
					<p className="text-gray-600">
						Unable to verify your access. Please try again.
					</p>
				</div>
			</div>
		);
	}

	// Check user access to experience
	const accessResult = await whopSdk.access.checkIfUserHasAccessToExperience({
		userId,
		experienceId,
	});

	if (!accessResult.hasAccess) {
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Access Denied</h1>
					<p className="text-gray-600">
						You don't have access to this experience.
					</p>
				</div>
			</div>
		);
	}

	// Get user data
	const user = await whopSdk.users.getUser({ userId });
	const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;

	if (!companyId) {
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
					<p className="text-gray-600">Company ID not configured.</p>
				</div>
			</div>
		);
	}

	// Get sync stats (last sync time and member count)
	let lastSyncAt: string | null = null;
	let memberCount = 0;

	try {
		// Get member count
		const { count, error: countError } = await supabase
			.from("member_activity")
			.select("*", { count: "exact", head: true })
			.eq("company_id", companyId);

		if (!countError) {
			memberCount = count || 0;
		}

		// Get last updated timestamp (most recent member update)
		const { data: lastUpdated, error: updateError } = await supabase
			.from("member_activity")
			.select("updated_at")
			.eq("company_id", companyId)
			.order("updated_at", { ascending: false })
			.limit(1) as { data: Array<{ updated_at: string }> | null; error: any };

		if (!updateError && lastUpdated && lastUpdated.length > 0) {
			lastSyncAt = lastUpdated[0].updated_at;
		}
	} catch (error) {
		console.error("[Settings] Error fetching sync stats:", error);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 py-4">
					{/* Breadcrumb */}
					<nav className="flex items-center gap-2 text-sm mb-4">
						<Link
							href={`/experiences/${experienceId}`}
							className="text-primary-600 hover:text-primary-700 font-medium"
						>
							Dashboard
						</Link>
						<span className="text-gray-400">/</span>
						<span className="text-gray-600 font-medium">Settings</span>
					</nav>

					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Settings</h1>
							<p className="text-gray-600 mt-1">
								Configure your Pulse monitoring preferences
							</p>
						</div>
						<div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
							<div className="w-2 h-2 rounded-full bg-green-500" />
							<span className="text-sm font-semibold text-gray-900">
								STUDIO DREWSKII
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Settings Content */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				<SettingsClientUI
					userName={user.name || "User"}
					companyId={companyId}
					experienceId={experienceId}
					lastSyncAt={lastSyncAt}
					memberCount={memberCount}
				/>
			</div>
		</div>
	);
}
