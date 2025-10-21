/**
 * Test RLS Policies
 * Check if Row Level Security is blocking access
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!;

console.log("🔒 Testing RLS Policies...\n");

async function testRLS() {
	// Test 1: Query with anon key (what the app uses)
	console.log("1️⃣ Testing with ANON key (what your app uses)...");
	const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

	const { data: anonData, error: anonError } = await supabaseAnon
		.from("member_activity")
		.select("*")
		.eq("company_id", companyId)
		.limit(5);

	if (anonError) {
		console.error("❌ Anon query error:", anonError);
		console.log("   This means RLS is blocking your queries!");
	} else {
		console.log(`✅ Anon query success: ${anonData?.length || 0} records`);
	}

	// Test 2: Query with service role key (bypasses RLS)
	if (supabaseServiceKey) {
		console.log("\n2️⃣ Testing with SERVICE ROLE key (bypasses RLS)...");
		const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

		const { data: serviceData, error: serviceError } = await supabaseService
			.from("member_activity")
			.select("*")
			.eq("company_id", companyId)
			.limit(5);

		if (serviceError) {
			console.error("❌ Service query error:", serviceError);
		} else {
			console.log(`✅ Service query success: ${serviceData?.length || 0} records`);
		}

		// Compare results
		if (!anonError && !serviceError) {
			if ((anonData?.length || 0) === (serviceData?.length || 0)) {
				console.log("\n✅ RLS is working correctly - both queries return same data");
			} else {
				console.log("\n⚠️  RLS might be blocking some data:");
				console.log(`   Anon key sees: ${anonData?.length || 0} records`);
				console.log(`   Service key sees: ${serviceData?.length || 0} records`);
			}
		}
	} else {
		console.log("\n⚠️  No service role key set - skipping service role test");
	}

	// Test 3: Check RLS policies
	console.log("\n3️⃣ Checking RLS policy configuration...");
	console.log("   The issue might be that RLS policies expect:");
	console.log("   - authenticated user (you're using anon key)");
	console.log("   - current_setting('app.company_id') to be set");
	console.log("\n   📋 Current RLS policies from migration:");
	console.log("   - Service role: full access ✅");
	console.log("   - Authenticated users: need current_setting('app.company_id')");
	console.log("   - Anonymous users: NO SELECT POLICY! ⚠️");
	console.log("\n   🔍 This is likely the problem!");
}

testRLS();
