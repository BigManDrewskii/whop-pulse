"use client";

/**
 * Pulse Dashboard - Client UI Component
 * Main interface for viewing member activity and engagement
 */

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { MemberActivity, EngagementStatus } from "@/lib/types";
import { formatDaysSinceActive } from "@/lib/engagement";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Tooltip } from "@/components/Tooltip";

interface DashboardClientUIProps {
	members: MemberActivity[];
	companyId: string;
	userName: string;
	experienceId?: string;
	showOnboarding?: boolean;
	onCloseOnboarding?: () => void;
}

type SortColumn = "name" | "score" | "status" | "last_active";
type SortDirection = "asc" | "desc";

export function DashboardClientUI({
	members,
	companyId,
	userName,
	experienceId,
}: DashboardClientUIProps) {
	const [selectedFilter, setSelectedFilter] =
		useState<EngagementStatus | "all">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortColumn, setSortColumn] = useState<SortColumn>("score");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	// Onboarding state (using React state instead of localStorage for iframe compatibility)
	const [showOnboarding, setShowOnboarding] = useState(false);

	// Note: Chart would go here but this simpler dashboard doesn't have it
	// If you want to add it, import EngagementChart and pass companyId

	// Check if first visit (default to showing onboarding once per session)
	useEffect(() => {
		// Show onboarding modal by default on first mount
		// User can manually trigger it again from settings if needed
		setShowOnboarding(true);
	}, []);

	// Handle sort column change
	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			// Toggle direction if clicking the same column
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			// Set new column and default to desc (highest first)
			setSortColumn(column);
			setSortDirection(column === "name" ? "asc" : "desc");
		}
	};

	// Calculate stats
	const stats = useMemo(() => {
		return {
			total: members.length,
			active: members.filter((m) => m.status === "active").length,
			at_risk: members.filter((m) => m.status === "at_risk").length,
			inactive: members.filter((m) => m.status === "inactive").length,
		};
	}, [members]);

	// Filter and search members
	const filteredMembers = useMemo(() => {
		const filtered = members.filter((member) => {
			// Filter by status
			const matchesFilter =
				selectedFilter === "all" || member.status === selectedFilter;

			// Filter by search query
			const matchesSearch =
				searchQuery === "" ||
				member.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				member.member_email
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				member.member_username
					?.toLowerCase()
					.includes(searchQuery.toLowerCase());

			return matchesFilter && matchesSearch;
		});

		return filtered;
	}, [members, selectedFilter, searchQuery]);

	// Sort filtered members
	const sortedMembers = useMemo(() => {
		const sorted = [...filteredMembers];

		sorted.sort((a, b) => {
			let compareValue = 0;

			switch (sortColumn) {
				case "name":
					const nameA = a.member_name?.toLowerCase() || "";
					const nameB = b.member_name?.toLowerCase() || "";
					compareValue = nameA.localeCompare(nameB);
					break;

				case "score":
					compareValue = a.activity_score - b.activity_score;
					break;

				case "status":
					// Order: active > at_risk > inactive
					const statusOrder = { active: 0, at_risk: 1, inactive: 2 };
					compareValue = statusOrder[a.status] - statusOrder[b.status];
					break;

				case "last_active":
					const dateA = a.last_active ? new Date(a.last_active).getTime() : 0;
					const dateB = b.last_active ? new Date(b.last_active).getTime() : 0;
					compareValue = dateA - dateB;
					break;
			}

			return sortDirection === "asc" ? compareValue : -compareValue;
		});

		return sorted;
	}, [filteredMembers, sortColumn, sortDirection]);

	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="max-w-7xl mx-auto space-y-6">

				{/* Stats Summary */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						title="Total Members"
						value={stats.total}
						color="bg-primary-500"
						textColor="text-primary-600"
					/>
					<StatCard
						title="Active"
						value={stats.active}
						color="bg-success-500"
						textColor="text-success-600"
					/>
					<StatCard
						title="At Risk"
						value={stats.at_risk}
						color="bg-warning-500"
						textColor="text-warning-600"
					/>
					<StatCard
						title="Inactive"
						value={stats.inactive}
						color="bg-error-500"
						textColor="text-error-600"
					/>
				</div>

				{/* Filters and Search */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<div className="flex flex-col lg:flex-row gap-4 lg:items-center">
						{/* Filter Buttons */}
						<div className="flex flex-wrap lg:flex-nowrap gap-2 lg:shrink-0">
							<FilterButton
								active={selectedFilter === "all"}
								onClick={() => setSelectedFilter("all")}
								count={stats.total}
							>
								All
							</FilterButton>
							<FilterButton
								active={selectedFilter === "active"}
								onClick={() => setSelectedFilter("active")}
								count={stats.active}
								variant="green"
							>
								Active
							</FilterButton>
							<FilterButton
								active={selectedFilter === "at_risk"}
								onClick={() => setSelectedFilter("at_risk")}
								count={stats.at_risk}
								variant="yellow"
							>
								At Risk
							</FilterButton>
							<FilterButton
								active={selectedFilter === "inactive"}
								onClick={() => setSelectedFilter("inactive")}
								count={stats.inactive}
								variant="red"
							>
								Inactive
							</FilterButton>
						</div>

						{/* Search Input */}
						<div className="w-full lg:w-80 lg:shrink-0">
							<div className="relative">
								<input
									type="text"
									placeholder="Search members by name or email..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full px-4 py-2.5 text-gray-900 placeholder:text-gray-500 bg-white border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-500 focus:outline-none hover:border-gray-400"
								/>
								<Search
									className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none"
									strokeWidth={2}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Member Table */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-background border-b border-gray-200">
								<tr>
									<SortableColumnHeader
										label="Member"
										column="name"
										currentColumn={sortColumn}
										direction={sortDirection}
										onSort={handleSort}
									/>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
										Email
									</th>
									<SortableColumnHeader
										label="Score"
										column="score"
										currentColumn={sortColumn}
										direction={sortDirection}
										onSort={handleSort}
									/>
									<SortableColumnHeader
										label="Status"
										column="status"
										currentColumn={sortColumn}
										direction={sortDirection}
										onSort={handleSort}
									/>
									<SortableColumnHeader
										label="Last Active"
										column="last_active"
										currentColumn={sortColumn}
										direction={sortDirection}
										onSort={handleSort}
										className="hidden lg:table-cell"
									/>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{sortedMembers.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="px-6 py-12 text-center text-gray-500"
										>
											<div className="flex flex-col items-center gap-2">
												<svg
													className="w-12 h-12 text-gray-300"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
													/>
												</svg>
												<p className="font-medium">No members found</p>
												<p className="text-sm">
													{searchQuery
														? "Try adjusting your search query"
														: "No members match the selected filter"}
												</p>
											</div>
										</td>
									</tr>
								) : (
									sortedMembers.map((member) => (
										<MemberRow key={member.id} member={member} />
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Table Footer */}
					{sortedMembers.length > 0 && (
						<div className="px-6 py-3 bg-background border-t border-gray-200 flex justify-between items-center">
							<div className="text-xs text-gray-500">
								{selectedFilter !== "all" && (
									<span>
										Filtered by:{" "}
										<span className="font-medium text-gray-700 capitalize">
											{selectedFilter.replace("_", " ")}
										</span>
									</span>
								)}
							</div>
							<p className="text-sm font-medium text-gray-700">
								Showing{" "}
								<span className="text-primary-600">{sortedMembers.length}</span> of{" "}
								<span className="text-gray-900">{members.length}</span> members
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Onboarding Modal */}
			<OnboardingModal
				isOpen={showOnboarding}
				onClose={() => setShowOnboarding(false)}
			/>
		</div>
	);
}

// Sortable Column Header Component
interface SortableColumnHeaderProps {
	label: string;
	column: SortColumn;
	currentColumn: SortColumn;
	direction: SortDirection;
	onSort: (column: SortColumn) => void;
	className?: string;
}

function SortableColumnHeader({
	label,
	column,
	currentColumn,
	direction,
	onSort,
	className = "",
}: SortableColumnHeaderProps) {
	const isActive = currentColumn === column;

	return (
		<th
			className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
			onClick={() => onSort(column)}
		>
			<div className="flex items-center gap-2">
				<span>{label}</span>
				<div className="flex flex-col">
					{isActive ? (
						direction === "asc" ? (
							<svg
								className="w-4 h-4 text-gray-700"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 15l7-7 7 7"
								/>
							</svg>
						) : (
							<svg
								className="w-4 h-4 text-gray-700"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						)
					) : (
						<svg
							className="w-4 h-4 text-gray-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
							/>
						</svg>
					)}
				</div>
			</div>
		</th>
	);
}

// Stat Card Component
interface StatCardProps {
	title: string;
	value: number;
	color: string;
	textColor: string;
}

function StatCard({ title, value, color, textColor }: StatCardProps) {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div>
				<p className="text-base font-semibold text-gray-600 mb-3">{title}</p>
				<p className={`text-4xl font-bold ${textColor}`}>{value}</p>
			</div>
		</div>
	);
}

// Filter Button Component
interface FilterButtonProps {
	active: boolean;
	onClick: () => void;
	count: number;
	variant?: "default" | "green" | "yellow" | "red";
	children: React.ReactNode;
}

function FilterButton({
	active,
	onClick,
	count,
	variant = "default",
	children,
}: FilterButtonProps) {
	const variantStyles = {
		default: active
			? "bg-primary-600 text-white border-primary-600 shadow-md hover:bg-primary-700"
			: "bg-white text-gray-700 border-gray-300 hover:bg-primary-50 hover:border-primary-300",
		green: active
			? "bg-success-600 text-white border-success-600 shadow-md hover:bg-success-700"
			: "bg-white text-gray-700 border-gray-300 hover:bg-success-50 hover:border-success-300",
		yellow: active
			? "bg-warning-500 text-white border-warning-500 shadow-md hover:bg-warning-600"
			: "bg-white text-gray-700 border-gray-300 hover:bg-warning-50 hover:border-warning-300",
		red: active
			? "bg-error-600 text-white border-error-600 shadow-md hover:bg-error-700"
			: "bg-white text-gray-700 border-gray-300 hover:bg-error-50 hover:border-error-300",
	};

	return (
		<button
			onClick={onClick}
			className={`
        px-4 py-2 rounded-lg border font-medium text-sm
        transition-all duration-200 flex items-center gap-2
        transform active:scale-95
        ${variantStyles[variant]}
      `}
		>
			{children}
			<span
				className={`
          px-2 py-0.5 rounded-full text-xs font-semibold
          ${active ? "bg-white/25" : "bg-gray-100 text-gray-700"}
        `}
			>
				{count}
			</span>
		</button>
	);
}

// Member Row Component
interface MemberRowProps {
	member: MemberActivity;
}

function MemberRow({ member }: MemberRowProps) {
	const statusConfig = {
		active: {
			badge: "bg-success-100 text-success-800",
			dot: "bg-success-500",
			label: "Active",
		},
		at_risk: {
			badge: "bg-warning-100 text-warning-800",
			dot: "bg-warning-500",
			label: "At Risk",
		},
		inactive: {
			badge: "bg-error-100 text-error-800",
			dot: "bg-error-500",
			label: "Inactive",
		},
	};

	const config = statusConfig[member.status];

	return (
		<tr className="hover:bg-primary-50/50 transition-all duration-150 border-b border-gray-100">
			{/* Member Info */}
			<td className="px-6 py-5">
				<div className="flex items-center gap-3">
					{/* Avatar */}
					<div className="flex-shrink-0">
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
							{member.member_name?.[0]?.toUpperCase() ||
								member.member_username?.[0]?.toUpperCase() ||
								"?"}
						</div>
					</div>
					{/* Name & Username */}
					<div className="min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{member.member_name || "Unknown"}
						</p>
						{member.member_username && (
							<p className="text-sm text-gray-500 truncate">
								@{member.member_username}
							</p>
						)}
					</div>
				</div>
			</td>

			{/* Email */}
			<td className="px-6 py-5 hidden md:table-cell">
				<p className="text-sm text-gray-900 truncate max-w-xs">
					{member.member_email || "—"}
				</p>
			</td>

			{/* Score */}
			<td className="px-6 py-5">
				<div className="flex items-center gap-2">
					<div className="flex-1 max-w-[100px]">
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all ${
									member.activity_score >= 80
										? "bg-success-500"
										: member.activity_score >= 40
											? "bg-warning-500"
											: "bg-error-500"
								}`}
								style={{ width: `${member.activity_score}%` }}
							/>
						</div>
					</div>
					<span className="text-sm font-medium text-gray-900 w-8">
						{member.activity_score}
					</span>
				</div>
			</td>

			{/* Status */}
			<td className="px-6 py-5">
				<span
					className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.badge}`}
				>
					<span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
					{config.label}
				</span>
			</td>

			{/* Last Active */}
			<td className="px-6 py-5 hidden lg:table-cell">
				<p className="text-sm text-gray-900">
					{member.last_active
						? formatDaysSinceActive(member.days_since_active)
						: "Never"}
				</p>
			</td>
		</tr>
	);
}

// Loading State Component
export function DashboardLoadingState() {
	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header Skeleton */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="space-y-2">
						<div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
						<div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
					</div>
					<div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
				</div>

				{/* Stats Skeleton */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
						>
							<div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4" />
							<div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
						</div>
					))}
				</div>

				{/* Filters Skeleton */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<div className="flex gap-2">
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"
							/>
						))}
					</div>
				</div>

				{/* Table Skeleton */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="flex items-center gap-4">
								<div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
								<div className="flex-1 space-y-2">
									<div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
									<div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
