/**
 * Test Supabase Connection
 * Quick script to verify database connectivity and check for existing data
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!;

console.log("🔍 Testing Supabase Connection...\n");
console.log(`URL: ${supabaseUrl}`);
console.log(`Company ID: ${companyId}\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
	try {
		// Test 1: Check if table exists by querying with limit 0
		console.log("1️⃣ Checking if member_activity table exists...");
		const { error: tableError } = await supabase
			.from("member_activity")
			.select("*")
			.limit(0);

		if (tableError) {
			console.error("❌ Table error:", tableError);
			return;
		}
		console.log("✅ Table exists!\n");

		// Test 2: Count total records
		console.log("2️⃣ Counting total records...");
		const { count, error: countError } = await supabase
			.from("member_activity")
			.select("*", { count: "exact", head: true });

		if (countError) {
			console.error("❌ Count error:", countError);
			return;
		}
		console.log(`✅ Total records: ${count}\n`);

		// Test 3: Count records for your company
		console.log("3️⃣ Counting records for your company...");
		const { count: companyCount, error: companyCountError } = await supabase
			.from("member_activity")
			.select("*", { count: "exact", head: true })
			.eq("company_id", companyId);

		if (companyCountError) {
			console.error("❌ Company count error:", companyCountError);
			return;
		}
		console.log(`✅ Records for company: ${companyCount}\n`);

		// Test 4: Fetch sample data
		console.log("4️⃣ Fetching sample data (limit 5)...");
		const { data, error } = await supabase
			.from("member_activity")
			.select("*")
			.eq("company_id", companyId)
			.limit(5);

		if (error) {
			console.error("❌ Query error:", error);
			return;
		}

		if (!data || data.length === 0) {
			console.log("⚠️  No data found for your company");
			console.log("   This means the database is empty for company:", companyId);
		} else {
			console.log(`✅ Found ${data.length} sample records:`);
			data.forEach((record, i) => {
				console.log(
					`   ${i + 1}. ${record.member_name} (${record.status}) - Score: ${record.activity_score}`
				);
			});
		}

		console.log("\n✅ Connection test complete!");
	} catch (error) {
		console.error("❌ Unexpected error:", error);
	}
}

testConnection();
