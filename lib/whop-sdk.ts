/**
 * Whop SDK Singleton
 * Server-side SDK instance for accessing Whop API
 */

import { WhopServerSdk } from "@whop/api";

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_WHOP_APP_ID) {
	console.error('[Whop SDK] CRITICAL ERROR: NEXT_PUBLIC_WHOP_APP_ID is not set!');
	console.error('[Whop SDK] Expected format: app_xxxxxxxxxxxxx');
}

if (!process.env.WHOP_API_KEY) {
	console.error('[Whop SDK] CRITICAL ERROR: WHOP_API_KEY is not set!');
}

if (!process.env.NEXT_PUBLIC_WHOP_APP_ID?.startsWith('app_')) {
	console.error('[Whop SDK] ERROR: Invalid NEXT_PUBLIC_WHOP_APP_ID format:', process.env.NEXT_PUBLIC_WHOP_APP_ID);
}

export const whopSdk = WhopServerSdk({
	// Add your app id here - this is required.
	// You can get this from the Whop dashboard after creating an app section.
	appId: process.env.NEXT_PUBLIC_WHOP_APP_ID as string,

	// Add your app api key here - this is required.
	// You can get this from the Whop dashboard after creating an app section.
	appApiKey: process.env.WHOP_API_KEY as string,

	// This will make api requests on behalf of this user.
	// This is optional, however most api requests need to be made on behalf of a user.
	// You can create an agent user for your app, and use their userId here.
	// You can also apply a different userId later with the `withUser` function.
	onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,

	// This is the companyId that will be used for the api requests.
	// When making api requests that query or mutate data about a company, you need to specify the companyId.
	// This is optional, however if not specified certain requests will fail.
	// This can also be applied later with the `withCompany` function.
	companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});

/**
 * Helper functions for Whop API
 *
 * Note: The Whop SDK provides methods like:
 * - whopSdk.users.getUser({ userId })
 * - whopSdk.experiences.getExperience({ experienceId })
 * - whopSdk.access.checkIfUserHasAccessToExperience({ userId, experienceId })
 * - whopSdk.companies.getCompany({ companyId })
 *
 * Use these built-in methods directly instead of custom wrappers.
 */
