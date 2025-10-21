/**
 * Test Script: Whop-to-Supabase Sync
 * Tests the sync functionality directly
 *
 * Run with: pnpm tsx scripts/test-sync.ts
 */

import { config } from "dotenv";
import { syncMembersFromWhop, getSyncStats } from "../lib/whop-sync";

// Load environment variables
config({ path: ".env.local" });

const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!;

if (!companyId) {
	console.error("❌ NEXT_PUBLIC_WHOP_COMPANY_ID not set in .env.local");
	process.exit(1);
}

console.log("🧪 Testing Whop-to-Supabase Sync\n");
console.log(`Company ID: ${companyId}\n`);

async function runTest() {
	try {
		// Step 1: Get stats before sync
		console.log("📊 Step 1: Getting stats before sync...");
		const statsBefore = await getSyncStats(companyId);
		console.log("   Before sync:");
		console.log(`   - Total members: ${statsBefore.total}`);
		console.log(`   - Active: ${statsBefore.active}`);
		console.log(`   - At Risk: ${statsBefore.at_risk}`);
		console.log(`   - Inactive: ${statsBefore.inactive}`);
		console.log(`   - Last synced: ${statsBefore.last_synced || "Never"}\n`);

		// Step 2: Run sync
		console.log("🔄 Step 2: Running sync from Whop...");
		const startTime = Date.now();

		const result = await syncMembersFromWhop(companyId);

		const duration = Date.now() - startTime;

		console.log(`   Sync completed in ${duration}ms\n`);

		// Step 3: Show results
		console.log("📋 Step 3: Sync Results:");
		console.log(`   Success: ${result.success ? "✅" : "❌"}`);
		console.log(`   Members synced: ${result.count}`);
		console.log(`   Skipped: ${result.skipped}`);
		console.log(`   Errors: ${result.errors.length}`);

		if (result.errors.length > 0) {
			console.log("\n   ⚠️  Errors encountered:");
			result.errors.forEach((error, i) => {
				console.log(`   ${i + 1}. ${error.type}: ${error.message}`);
			});
		}

		// Step 4: Get stats after sync
		console.log("\n📊 Step 4: Getting stats after sync...");
		const statsAfter = await getSyncStats(companyId);
		console.log("   After sync:");
		console.log(`   - Total members: ${statsAfter.total}`);
		console.log(`   - Active: ${statsAfter.active}`);
		console.log(`   - At Risk: ${statsAfter.at_risk}`);
		console.log(`   - Inactive: ${statsAfter.inactive}`);
		console.log(`   - Last synced: ${statsAfter.last_synced || "Never"}\n`);

		// Step 5: Summary
		console.log("📈 Summary:");
		const diff = statsAfter.total - statsBefore.total;
		if (diff > 0) {
			console.log(`   ✅ Added ${diff} new members`);
		} else if (diff < 0) {
			console.log(`   ⚠️  ${Math.abs(diff)} members removed`);
		} else {
			console.log(`   ✅ Updated ${statsAfter.total} existing members`);
		}

		if (result.success) {
			console.log("\n✅ Test completed successfully!");
			console.log(
				"\nNext steps:"
			);
			console.log(
				"1. Check Supabase dashboard to verify data: https://supabase.com/dashboard/project/myztbjdquegymxuhybhv/editor"
			);
			console.log("2. Refresh your app to see the synced data");
			console.log(
				"3. Set up a cron job or manual button to sync regularly\n"
			);
		} else {
			console.log("\n❌ Test failed - check errors above");
			process.exit(1);
		}
	} catch (error: any) {
		console.error("\n❌ Test failed with error:", error.message);
		console.error(error);
		process.exit(1);
	}
}

// Run the test
runTest();
