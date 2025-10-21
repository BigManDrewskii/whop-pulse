/**
 * Mock Trend Data Generator
 * Generates realistic engagement trend data for visualization
 * Uses seeded random for consistent data to avoid hydration mismatches
 */

export interface TrendDataPoint {
	date: string;
	score: number;
	activeCount: number;
	atRiskCount: number;
	inactiveCount: number;
}

// Seeded random number generator for consistent data
function seededRandom(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

export function generateMockTrendData(
	days: number = 30,
	totalMembers: number = 5
): TrendDataPoint[] {
	const data: TrendDataPoint[] = [];
	const today = new Date();

	// Use current date as seed for consistency within same day
	const seed =
		today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

		// Generate consistent data using seeded random
		const baseScore = 65 + seededRandom(seed + i) * 20; // 65-85 range
		const trend = Math.sin(i / 5) * 10; // Add wave pattern
		const noise = (seededRandom(seed + i + 1000) - 0.5) * 5; // Add randomness
		const score = Math.round(
			Math.max(40, Math.min(100, baseScore + trend + noise))
		);

		// Calculate member counts based on score and actual member count
		const activeCount = Math.round(totalMembers * (score / 100));
		const atRiskCount = Math.round(totalMembers * 0.3);
		const inactiveCount = totalMembers - activeCount - atRiskCount;

		data.push({
			date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
			score,
			activeCount: Math.max(0, activeCount),
			atRiskCount: Math.max(0, atRiskCount),
			inactiveCount: Math.max(0, inactiveCount),
		});
	}

	return data;
}
