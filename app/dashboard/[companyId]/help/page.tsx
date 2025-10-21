import { validateToken } from "@whop-apps/sdk";
import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import Link from "next/link";
import { HelpContent } from "./client-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Help Center - Pulse Member Activity Monitor",
	description:
		"Learn how to use Pulse to track member engagement, understand engagement scores, and boost retention in your Whop community.",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function HelpPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	// Get headers and params
	const headersList = await headers();
	const { companyId } = await params;

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
	const accessResult = await whopSdk.access.checkIfUserHasAccessToCompany({
		userId,
		companyId,
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

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-5xl mx-auto px-4 py-4">
					{/* Breadcrumb */}
					<nav className="flex items-center gap-2 text-sm mb-4">
						<Link
							href={`/dashboard/${companyId}`}
							className="text-primary-600 hover:text-primary-700 font-medium"
						>
							Dashboard
						</Link>
						<span className="text-gray-400">/</span>
						<span className="text-gray-600 font-medium">Help</span>
					</nav>

					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
							<p className="text-gray-600 mt-1">
								Learn how to get the most out of Pulse
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

			{/* Help Content */}
			<div className="max-w-5xl mx-auto px-4 py-8">
				<HelpContent userName={user.name || "User"} />
			</div>
		</div>
	);
}
