"use client";

/**
 * Engagement Chart Component
 * Displays engagement trend over time with interactive time range selector
 * HYDRATION-SAFE: Only renders on client-side to avoid mismatches
 */

import { useState, useEffect } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { generateMockTrendData, type TrendDataPoint } from "@/lib/generateTrendData";

interface EngagementChartProps {
	defaultDays?: 7 | 30 | 90;
	companyId?: string;
}

export function EngagementChart({
	defaultDays = 30,
	companyId,
}: EngagementChartProps) {
	const [timeRange, setTimeRange] = useState<7 | 30 | 90>(defaultDays);
	const [mounted, setMounted] = useState(false);
	const [data, setData] = useState<TrendDataPoint[]>([]);
	const [loading, setLoading] = useState(true);
	const [usingMockData, setUsingMockData] = useState(false);

	// Fetch historical data or use mock data
	useEffect(() => {
		setMounted(true);

		async function loadData() {
			setLoading(true);

			// If no companyId, use mock data
			if (!companyId) {
				setData(generateMockTrendData(timeRange));
				setUsingMockData(true);
				setLoading(false);
				return;
			}

			try {
				// Fetch real historical data from API
				const response = await fetch(
					`/api/history?companyId=${companyId}&days=${timeRange}`
				);

				if (!response.ok) {
					throw new Error("Failed to fetch historical data");
				}

				const result = await response.json();

				if (result.data && result.data.length > 0) {
					// Use real historical data
					setData(result.data);
					setUsingMockData(false);
				} else {
					// No historical data yet, use mock
					setData(generateMockTrendData(timeRange));
					setUsingMockData(true);
				}
			} catch (error) {
				console.error("Error fetching historical data:", error);
				// Fallback to mock data
				setData(generateMockTrendData(timeRange));
				setUsingMockData(true);
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, [timeRange, companyId]);

	// Don't render chart until mounted on client
	if (!mounted || loading || data.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-bold text-gray-900">Engagement Trend</h2>
					<div
						style={{
							width: "100%",
							height: "300px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<p className="text-sm text-gray-500">
							{loading ? "Loading chart..." : "No data available"}
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Calculate average score
	const avgScore = Math.round(
		data.reduce((sum, d) => sum + d.score, 0) / data.length
	);

	// Calculate trend (comparing first half to second half)
	const midpoint = Math.floor(data.length / 2);
	const firstHalfAvg =
		data.slice(0, midpoint).reduce((sum, d) => sum + d.score, 0) / midpoint;
	const secondHalfAvg =
		data.slice(midpoint).reduce((sum, d) => sum + d.score, 0) /
		(data.length - midpoint);
	const trend = secondHalfAvg - firstHalfAvg;
	const trendDirection =
		trend > 0 ? "up" : trend < 0 ? "down" : "stable";

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold text-gray-900">
							Engagement Trend
						</h2>
						{usingMockData && (
							<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
								Demo Data
							</span>
						)}
					</div>
					<p className="text-sm text-gray-600 mt-1">
						{usingMockData
							? "Showing demo data - historical tracking starts after first snapshot"
							: `Average engagement over the last ${timeRange} days`}
					</p>
				</div>

				<div className="flex items-center gap-4">
					{/* Time range selector */}
					<div className="flex gap-1 bg-gray-100 rounded-lg p-1">
						<button
							onClick={() => setTimeRange(7)}
							className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
								timeRange === 7
									? "bg-white text-primary-600 shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							7D
						</button>
						<button
							onClick={() => setTimeRange(30)}
							className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
								timeRange === 30
									? "bg-white text-primary-600 shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							30D
						</button>
						<button
							onClick={() => setTimeRange(90)}
							className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
								timeRange === 90
									? "bg-white text-primary-600 shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							90D
						</button>
					</div>

					{/* Average score and trend */}
					<div className="flex flex-col items-end gap-1">
						<div className="flex items-center gap-2">
							<span className="text-3xl font-bold text-primary-600">
								{avgScore}
							</span>
							<span className="text-sm text-gray-500">avg score</span>
						</div>
						<div className="flex items-center gap-1">
							<span
								className={`text-sm font-medium ${
									trendDirection === "up"
										? "text-green-600"
										: trendDirection === "down"
											? "text-red-600"
											: "text-gray-500"
								}`}
							>
								{trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "→"}{" "}
								{Math.abs(Math.round(trend))} points
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Chart */}
			<div style={{ width: "100%", height: "300px" }}>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
						<XAxis
							dataKey="date"
							stroke="#9ca3af"
							style={{ fontSize: "0.75rem" }}
							tick={{ fill: "#6b7280" }}
						/>
						<YAxis
							stroke="#9ca3af"
							style={{ fontSize: "0.75rem" }}
							tick={{ fill: "#6b7280" }}
							domain={[0, 100]}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "white",
								border: "1px solid #e5e7eb",
								borderRadius: "0.5rem",
								padding: "0.75rem",
								boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
							}}
							labelStyle={{ color: "#111827", fontWeight: 600 }}
							itemStyle={{ color: "#6b7280" }}
						/>
						<Legend
							wrapperStyle={{
								paddingTop: "1rem",
								fontSize: "0.875rem",
								color: "#6b7280",
							}}
						/>
						<Line
							type="monotone"
							dataKey="score"
							stroke="#6366f1"
							strokeWidth={3}
							dot={{ fill: "#6366f1", r: 4 }}
							activeDot={{ r: 6 }}
							name="Engagement Score"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* Legend / Info */}
			<div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-green-500" />
					<span>Active (80-100)</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-yellow-500" />
					<span>At Risk (40-79)</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-red-500" />
					<span>Inactive (0-39)</span>
				</div>
			</div>
		</div>
	);
}
