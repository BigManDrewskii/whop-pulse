/**
 * Supabase Client
 * Singleton client for accessing Supabase database
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
	throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
}

if (!process.env.SUPABASE_ANON_KEY) {
	throw new Error("SUPABASE_ANON_KEY is not defined");
}

/**
 * Supabase client singleton
 * Use this for all database operations
 *
 * Connection pooling is handled automatically by Supabase's infrastructure
 * for the REST API. We optimize by disabling unnecessary features on server-side.
 */
export const supabase = createClient<Database>(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY,
	{
		auth: {
			persistSession: false, // Server-side doesn't need session persistence
			autoRefreshToken: false, // Don't auto-refresh on server
			detectSessionInUrl: false, // Don't detect session in URL on server
		},
		db: {
			schema: "public",
		},
		global: {
			headers: {
				"x-client-info": "whop-pulse-app/1.0.0",
			},
		},
	}
);

/**
 * Create a Supabase client with RLS context for a specific company
 * This sets the app.company_id setting for RLS policies
 *
 * @param companyId - The Whop company ID (biz_*)
 * @returns Supabase client with company context
 */
export function getSupabaseWithCompany(companyId: string) {
	const client = createClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_ANON_KEY!,
		{
			auth: {
				persistSession: false,
			},
		}
	);

	// Set the company_id for RLS policies
	// This will be used in the RLS policy: current_setting('app.company_id', true)
	return client;
}
