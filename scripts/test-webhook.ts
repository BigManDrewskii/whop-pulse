/**
 * Webhook Test Utility
 * Simulates Whop webhook events for local testing
 *
 * Run with: pnpm tsx scripts/test-webhook.ts [event-type]
 */

import { config } from "dotenv";
import crypto from "crypto";

config({ path: ".env.local" });

const WEBHOOK_URL = process.env.NEXTAUTH_URL + "/api/webhooks/whop" || "http://localhost:3000/api/webhooks/whop";
const WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET || "test_secret";
const COMPANY_ID = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!;

/**
 * Mock webhook events
 */
const mockEvents = {
	"membership.went_valid": {
		action: "membership.went_valid",
		data: {
			id: "membership_test_123",
			user_id: "user_test_new_member",
			company_id: COMPANY_ID,
			email: "newmember@example.com",
			username: "newmember",
			name: "New Member",
			status: "active",
			created_at: new Date().toISOString(),
			valid_from: new Date().toISOString(),
		},
	},

	"membership.accessed": {
		action: "membership.accessed",
		data: {
			id: "membership_test_456",
			user_id: "user_test_active_member",
			company_id: COMPANY_ID,
			email: "activemember@example.com",
			username: "activemember",
			name: "Active Member",
			accessed_at: new Date().toISOString(),
		},
	},

	"membership.went_invalid": {
		action: "membership.went_invalid",
		data: {
			id: "membership_test_789",
			user_id: "user_test_expired_member",
			company_id: COMPANY_ID,
			email: "expired@example.com",
			username: "expiredmember",
			name: "Expired Member",
			expired_at: new Date().toISOString(),
		},
	},
};

/**
 * Generate webhook signature (HMAC SHA-256)
 */
function generateSignature(payload: string, secret: string): string {
	const hmac = crypto.createHmac("sha256", secret);
	hmac.update(payload);
	return hmac.digest("hex");
}

/**
 * Send webhook to local server
 */
async function sendWebhook(eventType: keyof typeof mockEvents) {
	console.log(`\n🧪 Testing Webhook: ${eventType}\n`);

	const event = mockEvents[eventType];

	if (!event) {
		console.error(`❌ Unknown event type: ${eventType}`);
		console.log("Available events:", Object.keys(mockEvents).join(", "));
		process.exit(1);
	}

	const payload = JSON.stringify(event);
	const signature = generateSignature(payload, WEBHOOK_SECRET);

	console.log("📦 Payload:");
	console.log(JSON.stringify(event, null, 2));
	console.log(`\n🔐 Signature: ${signature}`);
	console.log(`📍 Sending to: ${WEBHOOK_URL}\n`);

	try {
		const response = await fetch(WEBHOOK_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Whop-Signature": signature, // Adjust header name if needed
			},
			body: payload,
		});

		const data = await response.json();

		console.log(`📊 Response Status: ${response.status}`);
		console.log("📋 Response Body:");
		console.log(JSON.stringify(data, null, 2));

		if (response.ok) {
			console.log("\n✅ Webhook processed successfully!");
		} else {
			console.log("\n⚠️  Webhook returned non-200 status");
		}
	} catch (error: any) {
		console.error("\n❌ Error sending webhook:", error.message);
		console.error("\n💡 Make sure your dev server is running:");
		console.error("   pnpm dev\n");
		process.exit(1);
	}
}

/**
 * Test all webhook events
 */
async function testAll() {
	console.log("🧪 Testing All Webhook Events\n");

	for (const eventType of Object.keys(mockEvents) as Array<
		keyof typeof mockEvents
	>) {
		await sendWebhook(eventType);
		console.log("\n" + "=".repeat(60) + "\n");
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s between requests
	}

	console.log("✅ All webhook tests complete!\n");
}

/**
 * Main
 */
async function main() {
	const eventType = process.argv[2];

	if (!eventType) {
		console.log("🧪 Webhook Test Utility\n");
		console.log("Usage:");
		console.log("  pnpm tsx scripts/test-webhook.ts [event-type]\n");
		console.log("Available event types:");
		Object.keys(mockEvents).forEach((type) => {
			console.log(`  - ${type}`);
		});
		console.log("\nTest all events:");
		console.log("  pnpm tsx scripts/test-webhook.ts all\n");
		process.exit(0);
	}

	if (eventType === "all") {
		await testAll();
	} else if (mockEvents[eventType as keyof typeof mockEvents]) {
		await sendWebhook(eventType as keyof typeof mockEvents);
	} else {
		console.error(`❌ Unknown event type: ${eventType}`);
		console.log("Available events:", Object.keys(mockEvents).join(", "));
		process.exit(1);
	}
}

main();
