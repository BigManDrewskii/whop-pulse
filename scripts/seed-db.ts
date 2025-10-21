/**
 * Database Seeding Script
 * Populates the database with mock member data for testing
 *
 * Run with: npx tsx scripts/seed-db.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!;

if (!supabaseUrl || !supabaseServiceKey || !companyId) {
	console.error("❌ Missing environment variables!");
	console.error("   Please check .env.local has:");
	console.error("   - NEXT_PUBLIC_SUPABASE_URL");
	console.error("   - SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)");
	console.error("   - NEXT_PUBLIC_WHOP_COMPANY_ID");
	console.error("");
	console.error("   💡 Get your service role key from:");
	console.error("      Supabase Dashboard > Project Settings > API > service_role key");
	process.exit(1);
}

// Use service role key to bypass RLS for seeding
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

// Mock member data generator
function generateMockMembers() {
	const now = new Date();

	// Active members (0-7 days ago)
	const activeMembers = [
		{
			member_id: "user_active_001",
			member_email: "alex.johnson@example.com",
			member_username: "alexj",
			member_name: "Alex Johnson",
			days_ago: 2,
			score: 95,
			sessions: 47,
		},
		{
			member_id: "user_active_002",
			member_email: "sarah.williams@example.com",
			member_username: "sarahw",
			member_name: "Sarah Williams",
			days_ago: 1,
			score: 98,
			sessions: 62,
		},
		{
			member_id: "user_active_003",
			member_email: "michael.brown@example.com",
			member_username: "mikeb",
			member_name: "Michael Brown",
			days_ago: 0,
			score: 100,
			sessions: 89,
		},
		{
			member_id: "user_active_004",
			member_email: "emma.davis@example.com",
			member_username: "emmad",
			member_name: "Emma Davis",
			days_ago: 4,
			score: 88,
			sessions: 34,
		},
		{
			member_id: "user_active_005",
			member_email: "james.wilson@example.com",
			member_username: "jamesw",
			member_name: "James Wilson",
			days_ago: 5,
			score: 85,
			sessions: 28,
		},
		{
			member_id: "user_active_006",
			member_email: "olivia.moore@example.com",
			member_username: "oliviam",
			member_name: "Olivia Moore",
			days_ago: 6,
			score: 82,
			sessions: 41,
		},
		{
			member_id: "user_active_007",
			member_email: "william.taylor@example.com",
			member_username: "willt",
			member_name: "William Taylor",
			days_ago: 7,
			score: 80,
			sessions: 55,
		},
		{
			member_id: "user_active_008",
			member_email: "sophia.anderson@example.com",
			member_username: "sophiaa",
			member_name: "Sophia Anderson",
			days_ago: 1,
			score: 96,
			sessions: 72,
		},
		{
			member_id: "user_active_009",
			member_email: "benjamin.thomas@example.com",
			member_username: "benjt",
			member_name: "Benjamin Thomas",
			days_ago: 2,
			score: 91,
			sessions: 38,
		},
		{
			member_id: "user_active_010",
			member_email: "isabella.jackson@example.com",
			member_username: "bellaj",
			member_name: "Isabella Jackson",
			days_ago: 3,
			score: 89,
			sessions: 44,
		},
	];

	// At Risk members (8-30 days ago)
	const atRiskMembers = [
		{
			member_id: "user_risk_001",
			member_email: "lucas.white@example.com",
			member_username: "lucasw",
			member_name: "Lucas White",
			days_ago: 10,
			score: 72,
			sessions: 26,
		},
		{
			member_id: "user_risk_002",
			member_email: "mia.harris@example.com",
			member_username: "miah",
			member_name: "Mia Harris",
			days_ago: 15,
			score: 65,
			sessions: 19,
		},
		{
			member_id: "user_risk_003",
			member_email: "henry.martin@example.com",
			member_username: "henrym",
			member_name: "Henry Martin",
			days_ago: 12,
			score: 68,
			sessions: 31,
		},
		{
			member_id: "user_risk_004",
			member_email: "charlotte.thompson@example.com",
			member_username: "chart",
			member_name: "Charlotte Thompson",
			days_ago: 20,
			score: 58,
			sessions: 22,
		},
		{
			member_id: "user_risk_005",
			member_email: "daniel.garcia@example.com",
			member_username: "dang",
			member_name: "Daniel Garcia",
			days_ago: 25,
			score: 48,
			sessions: 15,
		},
		{
			member_id: "user_risk_006",
			member_email: "amelia.martinez@example.com",
			member_username: "ameliam",
			member_name: "Amelia Martinez",
			days_ago: 18,
			score: 61,
			sessions: 27,
		},
		{
			member_id: "user_risk_007",
			member_email: "matthew.robinson@example.com",
			member_username: "mattr",
			member_name: "Matthew Robinson",
			days_ago: 22,
			score: 54,
			sessions: 18,
		},
		{
			member_id: "user_risk_008",
			member_email: "evelyn.clark@example.com",
			member_username: "evelync",
			member_name: "Evelyn Clark",
			days_ago: 14,
			score: 67,
			sessions: 29,
		},
	];

	// Inactive members (30+ days ago)
	const inactiveMembers = [
		{
			member_id: "user_inactive_001",
			member_email: "ethan.rodriguez@example.com",
			member_username: "ethanr",
			member_name: "Ethan Rodriguez",
			days_ago: 35,
			score: 35,
			sessions: 12,
		},
		{
			member_id: "user_inactive_002",
			member_email: "ava.lewis@example.com",
			member_username: "aval",
			member_name: "Ava Lewis",
			days_ago: 45,
			score: 28,
			sessions: 8,
		},
		{
			member_id: "user_inactive_003",
			member_email: "alexander.lee@example.com",
			member_username: "alexl",
			member_name: "Alexander Lee",
			days_ago: 60,
			score: 18,
			sessions: 5,
		},
		{
			member_id: "user_inactive_004",
			member_email: "harper.walker@example.com",
			member_username: "harperw",
			member_name: "Harper Walker",
			days_ago: 40,
			score: 30,
			sessions: 10,
		},
		{
			member_id: "user_inactive_005",
			member_email: "sebastian.hall@example.com",
			member_username: "sebh",
			member_name: "Sebastian Hall",
			days_ago: 50,
			score: 22,
			sessions: 7,
		},
		{
			member_id: "user_inactive_006",
			member_email: "ella.allen@example.com",
			member_username: "ellaa",
			member_name: "Ella Allen",
			days_ago: 90,
			score: 10,
			sessions: 3,
		},
		{
			member_id: "user_inactive_007",
			member_email: "jack.young@example.com",
			member_username: "jacky",
			member_name: "Jack Young",
			days_ago: 75,
			score: 15,
			sessions: 4,
		},
	];

	// Convert to database records
	const allMembers = [
		...activeMembers.map((m) => ({
			...m,
			status: "active",
			company_id: companyId,
		})),
		...atRiskMembers.map((m) => ({
			...m,
			status: "at_risk",
			company_id: companyId,
		})),
		...inactiveMembers.map((m) => ({
			...m,
			status: "inactive",
			company_id: companyId,
		})),
	];

	return allMembers.map((member) => {
		const lastActive = new Date(now);
		lastActive.setDate(lastActive.getDate() - member.days_ago);

		return {
			company_id: member.company_id,
			member_id: member.member_id,
			member_email: member.member_email,
			member_username: member.member_username,
			member_name: member.member_name,
			last_active: lastActive.toISOString(),
			status: member.status,
			activity_score: member.score,
			total_sessions: member.sessions,
			last_login: lastActive.toISOString(),
			days_since_active: member.days_ago,
		};
	});
}

async function seedDatabase() {
	console.log("🌱 Starting database seed...\n");
	console.log(`📍 Company ID: ${companyId}`);
	console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

	try {
		// Check if data already exists
		const { count, error: countError } = await supabase
			.from("member_activity")
			.select("*", { count: "exact", head: true })
			.eq("company_id", companyId);

		if (countError) {
			throw countError;
		}

		if (count && count > 0) {
			console.log(
				`⚠️  Found ${count} existing members for this company.`
			);
			console.log("   The seed script will skip duplicates.\n");
		}

		// Generate mock data
		const members = generateMockMembers();
		console.log(`📦 Generated ${members.length} mock members\n`);

		// Insert data (will skip duplicates due to UNIQUE constraint)
		const { data, error } = await supabase
			.from("member_activity")
			.upsert(members, {
				onConflict: "company_id,member_id",
				ignoreDuplicates: false,
			})
			.select();

		if (error) {
			throw error;
		}

		console.log(`✅ Successfully seeded ${data?.length || 0} members!\n`);

		// Get summary stats
		const { data: stats, error: statsError } = await supabase
			.from("member_activity")
			.select("status")
			.eq("company_id", companyId);

		if (!statsError && stats) {
			const summary = {
				active: stats.filter((s) => s.status === "active").length,
				at_risk: stats.filter((s) => s.status === "at_risk").length,
				inactive: stats.filter((s) => s.status === "inactive").length,
			};

			console.log("📊 Database Summary:");
			console.log(`   Active: ${summary.active}`);
			console.log(`   At Risk: ${summary.at_risk}`);
			console.log(`   Inactive: ${summary.inactive}`);
			console.log(`   Total: ${stats.length}\n`);
		}

		console.log("✨ Database seeding complete!");
		console.log(
			"   Refresh your app to see the data: http://localhost:3000\n"
		);
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
}

// Run the seed function
seedDatabase();
