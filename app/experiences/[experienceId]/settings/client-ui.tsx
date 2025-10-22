"use client";

import { useState } from "react";
import { Toast } from "@/components/Toast";
import { ButtonSpinner } from "@/components/LoadingSpinner";
import { RefreshCw, Check, AlertTriangle, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SettingsClientUIProps {
	userName: string;
	companyId: string;
	lastSyncAt: string | null;
	memberCount: number;
	onShowTutorial?: () => void;
}

export function SettingsClientUI({
	userName,
	companyId,
	lastSyncAt,
	memberCount,
	onShowTutorial,
}: SettingsClientUIProps) {
	// Engagement Thresholds
	const [activeDays, setActiveDays] = useState(7);
	const [atRiskDays, setAtRiskDays] = useState(30);

	// Notification Preferences (disabled for now)
	const [emailAtRisk, setEmailAtRisk] = useState(false);
	const [dailyDigest, setDailyDigest] = useState(false);

	// Display Options
	const [defaultFilter, setDefaultFilter] = useState<string>("all");

	// Reset confirmation
	const [showResetConfirm, setShowResetConfirm] = useState(false);

	// Loading and Toast states
	const [isSaving, setIsSaving] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [toastType, setToastType] = useState<"success" | "error" | "info">(
		"success"
	);

	// Sync states
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncedMemberCount, setSyncedMemberCount] = useState(memberCount);
	const [lastSync, setLastSync] = useState(lastSyncAt);

	// Save Engagement Thresholds
	const handleSaveThresholds = async () => {
		setIsSaving(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setIsSaving(false);
		setToastMessage("Settings saved!");
		setToastType("success");
		setShowToast(true);
	};

	// Reset to defaults
	const handleReset = () => {
		setActiveDays(7);
		setAtRiskDays(30);
		setEmailAtRisk(false);
		setDailyDigest(false);
		setDefaultFilter("all");
		setShowResetConfirm(false);
		setToastMessage("Settings reset to defaults!");
		setToastType("success");
		setShowToast(true);
	};

	// Handle sync from Whop
	const handleSyncFromWhop = async () => {
		setIsSyncing(true);

		try {
			const response = await fetch("/api/sync-members", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ companyId }),
			});

			const data = await response.json();

			if (response.ok) {
				const syncedCount = data.data?.synced_count || 0;
				setSyncedMemberCount(data.data?.stats?.total || syncedCount);
				setLastSync(new Date().toISOString());
				setToastMessage(`Successfully synced ${syncedCount} members!`);
				setToastType("success");
				setShowToast(true);

				// Reload page after short delay to show fresh data
				setTimeout(() => {
					window.location.reload();
				}, 2000);
			} else {
				const errorMsg = data.error || data.message || "Failed to sync members";
				setToastMessage(errorMsg);
				setToastType("error");
				setShowToast(true);
			}
		} catch (error: any) {
			console.error("Sync error:", error);
			setToastMessage("Network error - please try again");
			setToastType("error");
			setShowToast(true);
		} finally {
			setIsSyncing(false);
		}
	};

	// Format time ago
	const getTimeAgo = () => {
		if (!lastSync) return "Never";
		try {
			return formatDistanceToNow(new Date(lastSync), { addSuffix: true });
		} catch {
			return "Unknown";
		}
	};

	// Determine sync status
	const getSyncStatus = () => {
		if (!lastSync) return { label: "No sync yet", color: "text-gray-500" };

		const hoursSinceSync =
			(Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);

		if (hoursSinceSync < 1) {
			return { label: "Up to date", color: "text-green-600" };
		} else if (hoursSinceSync < 24) {
			return { label: "Recent", color: "text-blue-600" };
		} else {
			return { label: "Sync recommended", color: "text-yellow-600" };
		}
	};

	const syncStatus = getSyncStatus();

	return (
		<div className="space-y-6">
			{/* Data Management */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="mb-6">
					<div className="flex items-center gap-2 mb-2">
						<Database className="w-5 h-5 text-primary-600" />
						<h2 className="text-lg font-bold text-gray-900">Data Management</h2>
					</div>
					<p className="text-sm text-gray-600">
						Sync member data from Whop and manage your database
					</p>
				</div>

				<div className="space-y-6">
					{/* Sync Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Last Sync */}
						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
								Last Synced
							</p>
							<p className="text-lg font-semibold text-gray-900">
								{getTimeAgo()}
							</p>
						</div>

						{/* Member Count */}
						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
								Members in Database
							</p>
							<p className="text-lg font-semibold text-gray-900">
								{syncedMemberCount} members
							</p>
						</div>

						{/* Status */}
						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
								Status
							</p>
							<div className="flex items-center gap-2">
								<div
									className={`w-2 h-2 rounded-full ${
										syncStatus.label === "Up to date"
											? "bg-green-500"
											: syncStatus.label === "Recent"
												? "bg-blue-500"
												: "bg-yellow-500"
									}`}
								/>
								<p className={`text-lg font-semibold ${syncStatus.color}`}>
									{syncStatus.label}
								</p>
							</div>
						</div>
					</div>

					{/* Sync Button */}
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="text-sm font-medium text-yellow-900 mb-1">
									Manual Sync
								</p>
								<p className="text-sm text-yellow-800 mb-3">
									This will fetch the latest member data from Whop and update
									engagement scores. Webhooks keep data fresh automatically, so
									manual sync is only needed for backfilling or troubleshooting.
								</p>
								<button
									onClick={handleSyncFromWhop}
									disabled={isSyncing}
									className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
										isSyncing
											? "bg-gray-400 cursor-not-allowed text-white"
											: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md"
									}`}
								>
									<RefreshCw
										className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
									/>
									{isSyncing ? "Syncing from Whop..." : "Sync from Whop"}
								</button>
							</div>
						</div>
					</div>

					{/* Webhook Info */}
					<div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
						<div className="flex gap-3">
							<svg
								className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
							<div className="text-sm text-primary-800">
								<p className="font-medium mb-1">Real-time updates enabled</p>
								<p className="text-primary-700">
									Member data is updated automatically via Whop webhooks when members
									join, login, or leave. Manual sync is only needed for initial setup
									or if you suspect data is out of sync.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Engagement Thresholds */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="mb-6">
					<h2 className="text-lg font-bold text-gray-900">
						Engagement Thresholds
					</h2>
					<p className="text-sm text-gray-600 mt-1">
						Configure when members are considered active or at risk based on
						their last login
					</p>
				</div>

				<div className="space-y-4">
					{/* Active Days Input */}
					<div>
						<label
							htmlFor="active-days"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Active if logged in within X days
						</label>
						<div className="flex items-center gap-4">
							<input
								id="active-days"
								type="number"
								min="1"
								max="30"
								value={activeDays}
								onChange={(e) => setActiveDays(Number(e.target.value))}
								className="w-24 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-500 transition-all"
							/>
							<span className="text-sm text-gray-600">
								Members active in the last {activeDays} days will be marked as{" "}
								<span className="font-medium text-green-600">Active</span>
							</span>
						</div>
					</div>

					{/* At Risk Days Input */}
					<div>
						<label
							htmlFor="atrisk-days"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							At Risk if logged in within X days
						</label>
						<div className="flex items-center gap-4">
							<input
								id="atrisk-days"
								type="number"
								min="8"
								max="90"
								value={atRiskDays}
								onChange={(e) => setAtRiskDays(Number(e.target.value))}
								className="w-24 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-500 transition-all"
							/>
							<span className="text-sm text-gray-600">
								Members inactive for {activeDays}-{atRiskDays} days will be{" "}
								<span className="font-medium text-yellow-600">At Risk</span>
							</span>
						</div>
					</div>

					{/* Info Box */}
					<div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
						<div className="flex gap-3">
							<svg
								className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
							<div className="text-sm text-primary-800">
								<p className="font-medium mb-1">How it works:</p>
								<ul className="space-y-1 text-primary-700">
									<li>
										• <strong>Active:</strong> 0-{activeDays} days since last
										login
									</li>
									<li>
										• <strong>At Risk:</strong> {activeDays + 1}-{atRiskDays}{" "}
										days since last login
									</li>
									<li>
										• <strong>Inactive:</strong> {atRiskDays}+ days since last
										login
									</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Save Button */}
					<div className="pt-4">
						<button
							onClick={handleSaveThresholds}
							disabled={isSaving}
							className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isSaving && <ButtonSpinner />}
							{isSaving ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</div>
			</div>

			{/* Notification Preferences */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="mb-6">
					<h2 className="text-lg font-bold text-gray-900">
						Notification Preferences
					</h2>
					<p className="text-sm text-gray-600 mt-1">
						Get notified about important changes in your community
					</p>
				</div>

				<div className="space-y-4">
					{/* Email At Risk Toggle */}
					<div className="flex items-center justify-between py-3 border-b border-gray-100">
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<label
									htmlFor="email-atrisk"
									className="text-sm font-medium text-gray-700"
								>
									Email me when members go At Risk
								</label>
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
									Coming Soon
								</span>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								Receive email alerts when members haven't logged in recently
							</p>
						</div>
						<button
							disabled
							className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-gray-300 bg-gray-200 transition-colors duration-200 ease-in-out opacity-50"
						>
							<span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
						</button>
					</div>

					{/* Daily Digest Toggle */}
					<div className="flex items-center justify-between py-3">
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<label
									htmlFor="daily-digest"
									className="text-sm font-medium text-gray-700"
								>
									Daily digest of community health
								</label>
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
									Coming Soon
								</span>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								Get a daily summary of member activity and engagement trends
							</p>
						</div>
						<button
							disabled
							className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-gray-300 bg-gray-200 transition-colors duration-200 ease-in-out opacity-50"
						>
							<span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
						</button>
					</div>
				</div>
			</div>

			{/* Display Options */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="mb-6">
					<h2 className="text-lg font-bold text-gray-900">Display Options</h2>
					<p className="text-sm text-gray-600 mt-1">
						Customize how your dashboard appears
					</p>
				</div>

				<div className="space-y-4">
					{/* Default Filter Select */}
					<div className="py-3">
						<label
							htmlFor="default-filter"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Default filter
						</label>
						<select
							id="default-filter"
							value={defaultFilter}
							onChange={(e) => setDefaultFilter(e.target.value)}
							className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-500 transition-all bg-white text-gray-900"
						>
							<option value="all">All Members</option>
							<option value="active">Active Only</option>
							<option value="at_risk">At Risk Only</option>
							<option value="inactive">Inactive Only</option>
						</select>
						<p className="text-xs text-gray-500 mt-2">
							The filter that will be selected when you open the dashboard
						</p>
					</div>
				</div>
			</div>

			{/* Danger Zone */}
			<div className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-6">
				<div className="mb-6">
					<h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
					<p className="text-sm text-gray-600 mt-1">
						Irreversible actions that affect your settings
					</p>
				</div>

				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-sm font-medium text-gray-900">
							Reset to defaults
						</h3>
						<p className="text-xs text-gray-500 mt-1">
							Restore all settings to their original default values
						</p>
					</div>
					<button
						onClick={() => setShowResetConfirm(true)}
						className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all duration-200 border border-red-200"
					>
						Reset Settings
					</button>
				</div>
			</div>

			{/* Reset Confirmation Modal */}
			{showResetConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
								<svg
									className="w-6 h-6 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="text-lg font-bold text-gray-900">
									Reset to Defaults?
								</h3>
								<p className="text-sm text-gray-600 mt-1">
									This will restore all settings to their original values.
								</p>
							</div>
						</div>

						<div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
							<p className="text-sm text-red-800">This action will reset:</p>
							<ul className="text-sm text-red-700 mt-2 space-y-1">
								<li>• Active threshold: 7 days</li>
								<li>• At Risk threshold: 30 days</li>
								<li>• Default filter: All Members</li>
								<li>• Demo data: Enabled</li>
							</ul>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() => setShowResetConfirm(false)}
								className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
							>
								Cancel
							</button>
							<button
								onClick={handleReset}
								className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
							>
								Reset Settings
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Help & Tutorial */}
			{onShowTutorial && (
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="mb-4">
						<h2 className="text-lg font-bold text-gray-900">Help & Tutorial</h2>
						<p className="text-sm text-gray-600 mt-1">
							Need help getting started?
						</p>
					</div>
					<button
						onClick={onShowTutorial}
						className="w-full px-4 py-3 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition-all duration-200 border border-primary-200 flex items-center justify-center gap-2"
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
								d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
							/>
						</svg>
						Show Tutorial
					</button>
				</div>
			)}

			{/* Toast Notification */}
			{showToast && (
				<Toast
					message={toastMessage}
					type={toastType}
					onClose={() => setShowToast(false)}
					duration={3000}
				/>
			)}
		</div>
	);
}
