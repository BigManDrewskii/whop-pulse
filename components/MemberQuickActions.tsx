"use client";

/**
 * Member Quick Actions Component
 * Hover menu with quick actions for each member row
 */

import { useState } from "react";
import type { MemberActivity } from "@/lib/types";

interface MemberQuickActionsProps {
	member: MemberActivity;
	onViewDetails: (member: MemberActivity) => void;
}

export function MemberQuickActions({
	member,
	onViewDetails,
}: MemberQuickActionsProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleSendMessage = () => {
		if (member.member_username) {
			window.open(
				`https://whop.com/messages/${member.member_username}`,
				"_blank"
			);
		}
		setIsOpen(false);
	};

	const handleViewProfile = () => {
		if (member.member_username) {
			window.open(`https://whop.com/@${member.member_username}`, "_blank");
		}
		setIsOpen(false);
	};

	const handleViewDetails = () => {
		onViewDetails(member);
		setIsOpen(false);
	};

	return (
		<div className="relative">
			{/* Three-dot menu button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="quick-actions-btn px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
				style={{
					fontSize: "1.25rem",
					fontWeight: "bold",
					lineHeight: "1",
				}}
				aria-label="Member actions"
			>
				⋮
			</button>

			{/* Dropdown menu */}
			{isOpen && (
				<>
					{/* Backdrop to close menu */}
					<div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

					{/* Menu content */}
					<div className="absolute right-0 top-full mt-1 z-20 quick-actions-menu bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] py-1">
						<button
							onClick={handleViewDetails}
							disabled={!member}
							className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							View Details
						</button>

						<button
							onClick={handleSendMessage}
							disabled={!member.member_username}
							className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg
								className="w-4 h-4"
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

						<button
							onClick={handleViewProfile}
							disabled={!member.member_username}
							className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							View Profile
						</button>
					</div>
				</>
			)}
		</div>
	);
}
