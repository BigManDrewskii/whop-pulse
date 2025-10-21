"use client";

/**
 * Comparison View Component
 * Shows week-over-week changes in member engagement
 */

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Users, Activity } from "lucide-react";

interface ComparisonData {
	current: {
		total: number;
		active: number;
		at_risk: number;
		inactive: number;
		avg_score: number;
	};
	previous: {
		total: number;
		active: number;
		at_risk: number;
		inactive: number;
		avg_score: number;
	};
	changes: {
		total: number;
		active: number;
		at_risk: number;
		inactive: number;
		avg_score: number;
	};
}

interface ComparisonViewProps {
	companyId: string;
}

export function ComparisonView({ companyId }: ComparisonViewProps) {
	const [data, setData] = useState<ComparisonData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		async function loadComparison() {
			try {
				const response = await fetch(`/api/comparison?companyId=${companyId}`);

				if (!response.ok) {
					throw new Error("Failed to fetch comparison data");
				}

				const result = await response.json();

				if (result.success && result.data) {
					setData(result.data);
					setError(false);
				} else {
					setError(true);
				}
			} catch (err) {
				console.error("Error loading comparison:", err);
				setError(true);
			} finally {
				setLoading(false);
			}
		}

		loadComparison();
	}, [companyId]);

	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-xl font-bold text-gray-900 mb-4">
					Compared to Last Week
				</h2>
				<div className="flex items-center justify-center h-32">
					<p className="text-sm text-gray-500">Loading comparison...</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-xl font-bold text-gray-900 mb-4">
					Compared to Last Week
				</h2>
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<p className="text-sm text-yellow-800">
						Not enough historical data yet. Comparison will be available after 7
						days of tracking.
					</p>
				</div>
			</div>
		);
	}

	// Check if we have meaningful comparison (previous data exists)
	const hasComparison = data.previous.total > 0;

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div className="mb-6">
				<h2 className="text-xl font-bold text-gray-900 mb-1">
					Compared to Last Week
				</h2>
				<p className="text-sm text-gray-600">
					{hasComparison
						? "See how your community engagement has changed"
						: "Tracking started - comparison will be available in 7 days"}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				{/* Total Members */}
				<ComparisonCard
					label="Total Members"
					current={data.current.total}
					change={data.changes.total}
					icon={<Users className="w-5 h-5" />}
					showComparison={hasComparison}
				/>

				{/* Average Score */}
				<ComparisonCard
					label="Avg Score"
					current={Math.round(data.current.avg_score)}
					change={data.changes.avg_score}
					icon={<Activity className="w-5 h-5" />}
					showComparison={hasComparison}
					isScore
				/>

				{/* Active Members */}
				<ComparisonCard
					label="Active"
					current={data.current.active}
					change={data.changes.active}
					color="green"
					showComparison={hasComparison}
				/>

				{/* At Risk Members */}
				<ComparisonCard
					label="At Risk"
					current={data.current.at_risk}
					change={data.changes.at_risk}
					color="yellow"
					showComparison={hasComparison}
				/>

				{/* Inactive Members */}
				<ComparisonCard
					label="Inactive"
					current={data.current.inactive}
					change={data.changes.inactive}
					color="red"
					showComparison={hasComparison}
				/>
			</div>
		</div>
	);
}

/**
 * Individual Comparison Card
 */
interface ComparisonCardProps {
	label: string;
	current: number;
	change: number;
	icon?: React.ReactNode;
	color?: "green" | "yellow" | "red";
	showComparison: boolean;
	isScore?: boolean;
}

function ComparisonCard({
	label,
	current,
	change,
	icon,
	color,
	showComparison,
	isScore = false,
}: ComparisonCardProps) {
	const colorStyles = {
		green: "text-green-600",
		yellow: "text-yellow-600",
		red: "text-red-600",
	};

	const textColor = color ? colorStyles[color] : "text-primary-600";

	// Determine trend
	const isPositive = change > 0;
	const isNegative = change < 0;
	const isNeutral = change === 0;

	// For scores, positive is good. For inactive, negative is good.
	const isGoodChange =
		color === "red" ? isNegative : color === "yellow" ? isNegative : isPositive;

	const trendColor = isNeutral
		? "text-gray-500"
		: isGoodChange
			? "text-green-600"
			: "text-red-600";

	const TrendIcon = isPositive
		? TrendingUp
		: isNegative
			? TrendingDown
			: Minus;

	return (
		<div className="bg-gray-50 rounded-lg p-4">
			<div className="flex items-center justify-between mb-2">
				<p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
					{label}
				</p>
				{icon && <div className="text-gray-400">{icon}</div>}
			</div>

			<div className="flex items-baseline gap-2">
				<p className={`text-2xl font-bold ${textColor}`}>{current}</p>
				{isScore && <span className="text-sm text-gray-500">pts</span>}
			</div>

			{showComparison && (
				<div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
					<TrendIcon className="w-4 h-4" />
					<span className="text-sm font-medium">
						{isPositive && "+"}
						{change.toFixed(isScore ? 1 : 0)}
						{!isScore && " members"}
					</span>
					<span className="text-xs text-gray-500 ml-1">vs last week</span>
				</div>
			)}

			{!showComparison && (
				<div className="flex items-center gap-1 mt-2 text-gray-400">
					<Minus className="w-4 h-4" />
					<span className="text-sm">No comparison yet</span>
				</div>
			)}
		</div>
	);
}
