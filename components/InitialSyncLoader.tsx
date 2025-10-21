"use client";

/**
 * Initial Sync Loader
 * Shows loading state during first-time member data sync from Whop
 */

import { useEffect, useState } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";

interface InitialSyncLoaderProps {
	status: "syncing" | "success" | "error";
	memberCount?: number;
	error?: string;
}

export function InitialSyncLoader({
	status,
	memberCount = 0,
	error,
}: InitialSyncLoaderProps) {
	const [dots, setDots] = useState("");

	// Animated dots for loading state
	useEffect(() => {
		if (status === "syncing") {
			const interval = setInterval(() => {
				setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
			}, 500);
			return () => clearInterval(interval);
		}
	}, [status]);

	if (status === "syncing") {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
					<div className="text-center">
						{/* Spinning Icon */}
						<div className="mb-6 flex justify-center">
							<div className="relative">
								<div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
									<RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
								</div>
								<div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-ping opacity-75" />
							</div>
						</div>

						{/* Title */}
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Setting Up Your Dashboard{dots}
						</h2>

						{/* Description */}
						<p className="text-gray-600 mb-6">
							We're syncing your member data from Whop. This only happens once,
							then webhooks keep everything up to date automatically.
						</p>

						{/* Progress Steps */}
						<div className="space-y-3 text-left">
							<ProgressStep
								label="Connecting to Whop API"
								completed={true}
							/>
							<ProgressStep
								label="Fetching member data"
								completed={memberCount > 0}
								current={memberCount === 0}
							/>
							<ProgressStep
								label="Calculating engagement scores"
								completed={false}
								current={memberCount > 0}
							/>
							<ProgressStep
								label="Saving to database"
								completed={false}
								current={false}
							/>
						</div>

						{memberCount > 0 && (
							<div className="mt-6 text-sm text-gray-500">
								Processing {memberCount} members...
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	if (status === "success") {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
					<div className="text-center">
						{/* Success Icon */}
						<div className="mb-6 flex justify-center">
							<div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
								<Check className="w-10 h-10 text-green-600" />
							</div>
						</div>

						{/* Title */}
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Dashboard Ready!
						</h2>

						{/* Description */}
						<p className="text-gray-600 mb-6">
							Successfully synced {memberCount} members. Your dashboard is ready
							to use.
						</p>

						{/* Auto-redirect message */}
						<p className="text-sm text-gray-500">Redirecting...</p>
					</div>
				</div>
			</div>
		);
	}

	if (status === "error") {
		const handleRetry = () => {
			window.location.reload();
		};

		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-8">
					<div className="text-center">
						{/* Error Icon */}
						<div className="mb-6 flex justify-center">
							<div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
								<AlertCircle className="w-10 h-10 text-red-600" />
							</div>
						</div>

						{/* Title */}
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Sync Failed
						</h2>

						{/* Error Message */}
						<p className="text-gray-600 mb-6">
							{error || "Unable to sync member data from Whop"}
						</p>

						{/* Possible Issues */}
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
							<p className="text-sm font-medium text-yellow-900 mb-2">
								Possible issues:
							</p>
							<ul className="text-sm text-yellow-800 space-y-1">
								<li>• Whop API credentials may be incorrect</li>
								<li>• No members exist in your Whop community yet</li>
								<li>• Supabase service role key not configured</li>
								<li>• Network connectivity issues</li>
							</ul>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								onClick={handleRetry}
								className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
							>
								<RefreshCw className="w-4 h-4" />
								Try Again
							</button>
							<button
								onClick={handleRetry}
								className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
							>
								Reload Page
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return null;
}

/**
 * Progress Step Component
 */
function ProgressStep({
	label,
	completed,
	current,
}: {
	label: string;
	completed: boolean;
	current?: boolean;
}) {
	return (
		<div className="flex items-center gap-3">
			<div
				className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
					completed
						? "bg-green-500"
						: current
							? "bg-primary-500 animate-pulse"
							: "bg-gray-200"
				}`}
			>
				{completed ? (
					<Check className="w-4 h-4 text-white" />
				) : current ? (
					<div className="w-2 h-2 rounded-full bg-white" />
				) : (
					<div className="w-2 h-2 rounded-full bg-gray-400" />
				)}
			</div>
			<span
				className={`text-sm ${
					completed
						? "text-gray-900 font-medium"
						: current
							? "text-primary-600 font-medium"
							: "text-gray-500"
				}`}
			>
				{label}
			</span>
		</div>
	);
}
