"use client";

/**
 * Member Detail Modal Component
 * Displays detailed information about a member including engagement score and activity
 */

import { formatDistanceToNow } from "date-fns";
import type { MemberActivity } from "@/lib/types";

interface MemberDetailModalProps {
	member: MemberActivity | null;
	isOpen: boolean;
	onClose: () => void;
}

export function MemberDetailModal({
	member,
	isOpen,
	onClose,
}: MemberDetailModalProps) {
	if (!member || !isOpen) return null;

	const statusColors = {
		active: {
			badge: "bg-green-100 text-green-800",
			progress: "bg-green-500",
		},
		at_risk: {
			badge: "bg-yellow-100 text-yellow-800",
			progress: "bg-yellow-500",
		},
		inactive: {
			badge: "bg-red-100 text-red-800",
			progress: "bg-red-500",
		},
	};

	const config = statusColors[member.status];

	const handleSendMessage = () => {
		if (member.member_username) {
			window.open(
				`https://whop.com/messages/${member.member_username}`,
				"_blank"
			);
		}
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div
					className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="p-6 space-y-6">
						{/* Header with member info */}
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-4">
								{/* Avatar */}
								<div className="flex-shrink-0">
									<div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-semibold">
										{member.member_name?.[0]?.toUpperCase() ||
											member.member_username?.[0]?.toUpperCase() ||
											"?"}
									</div>
								</div>

								{/* Name and username */}
								<div className="flex flex-col gap-1">
									<h2 className="text-2xl font-bold text-gray-900">
										{member.member_name || "Unknown"}
									</h2>
									{member.member_username && (
										<p className="text-sm text-gray-500">
											@{member.member_username}
										</p>
									)}
								</div>
							</div>

							{/* Status Badge */}
							<span
								className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.badge}`}
							>
								<span
									className={`w-2 h-2 rounded-full ${config.progress.replace("bg-", "bg-").replace("500", "600")}`}
								/>
								{member.status === "at_risk"
									? "At Risk"
									: member.status.charAt(0).toUpperCase() + member.status.slice(1)}
							</span>
						</div>

						{/* Engagement Score Section */}
						<div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
							<div className="flex flex-col gap-3">
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
									Engagement Score
								</p>
								<div className="flex items-center gap-3">
									<span className="text-5xl font-bold text-primary-600">
										{member.activity_score}
									</span>
									<span className="text-2xl text-gray-400 font-medium">
										/ 100
									</span>
								</div>

								{/* Progress bar */}
								<div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
									<div
										className={`h-full ${config.progress} transition-all duration-500 ease-out`}
										style={{ width: `${member.activity_score}%` }}
									/>
								</div>
							</div>
						</div>

						{/* Member Details Grid */}
						<div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
							<p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
								Member Details
							</p>

							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Email</span>
									<span className="text-sm font-medium text-gray-900">
										{member.member_email || "—"}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Username</span>
									<span className="text-sm font-medium text-gray-900">
										{member.member_username ? `@${member.member_username}` : "—"}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Last Active</span>
									<span className="text-sm font-medium text-gray-900">
										{member.last_active
											? formatDistanceToNow(new Date(member.last_active), {
													addSuffix: true,
												})
											: "Never"}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Total Sessions</span>
									<span className="text-sm font-medium text-gray-900">
										{member.total_sessions || 0}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Days Since Active</span>
									<span className="text-sm font-medium text-gray-900">
										{member.days_since_active || 0} days
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Status</span>
									<span
										className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.badge}`}
									>
										<span
											className={`w-1.5 h-1.5 rounded-full ${config.progress.replace("bg-", "bg-").replace("500", "600")}`}
										/>
										{member.status === "at_risk"
											? "At Risk"
											: member.status.charAt(0).toUpperCase() +
												member.status.slice(1)}
									</span>
								</div>
							</div>
						</div>

						{/* Activity Timeline (placeholder) */}
						<div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
							<p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
								Recent Activity
							</p>
							<div className="flex items-center justify-center py-8">
								<p className="text-sm text-gray-400">
									Activity timeline coming soon...
								</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
							<button
								onClick={onClose}
								className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 border border-gray-300"
							>
								Close
							</button>
							<button
								onClick={handleSendMessage}
								disabled={!member.member_username}
								className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								Send Message
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
