"use client";

/**
 * Sync Button Component
 * Triggers Whop-to-Supabase member sync
 *
 * Usage:
 * import { SyncButton } from "@/components/SyncButton";
 * <SyncButton companyId="biz_xxx" />
 */

import { useState } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";

interface SyncButtonProps {
	companyId?: string;
	onSyncComplete?: (result: any) => void;
}

export function SyncButton({ companyId, onSyncComplete }: SyncButtonProps) {
	const [syncing, setSyncing] = useState(false);
	const [result, setResult] = useState<{
		success: boolean;
		message: string;
	} | null>(null);

	const handleSync = async () => {
		setSyncing(true);
		setResult(null);

		try {
			const response = await fetch("/api/sync-members", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ companyId }),
			});

			const data = await response.json();

			if (response.ok) {
				setResult({
					success: true,
					message:
						data.message || `Synced ${data.data?.synced_count || 0} members`,
				});

				// Call callback if provided
				if (onSyncComplete) {
					onSyncComplete(data);
				}

				// Auto-clear success message after 5 seconds
				setTimeout(() => {
					setResult(null);
				}, 5000);
			} else {
				setResult({
					success: false,
					message:
						data.error || data.message || "Failed to sync members",
				});
			}
		} catch (error: any) {
			console.error("Sync error:", error);
			setResult({
				success: false,
				message: "Network error - please try again",
			});
		} finally {
			setSyncing(false);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<button
				onClick={handleSync}
				disabled={syncing}
				className={`
					flex items-center gap-2 px-4 py-2 rounded-lg font-medium
					transition-all duration-200
					${
						syncing
							? "bg-gray-400 cursor-not-allowed"
							: "bg-primary-600 hover:bg-primary-700 active:scale-95"
					}
					text-white shadow-sm
				`}
			>
				<RefreshCw
					className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
				/>
				{syncing ? "Syncing..." : "Sync Members"}
			</button>

			{result && (
				<div
					className={`
						flex items-center gap-2 px-3 py-2 rounded-lg text-sm
						${
							result.success
								? "bg-green-50 text-green-800 border border-green-200"
								: "bg-red-50 text-red-800 border border-red-200"
						}
					`}
				>
					{result.success ? (
						<Check className="w-4 h-4 flex-shrink-0" />
					) : (
						<AlertCircle className="w-4 h-4 flex-shrink-0" />
					)}
					<span>{result.message}</span>
				</div>
			)}
		</div>
	);
}

/**
 * Example usage in a page:
 *
 * ```tsx
 * import { SyncButton } from "@/components/SyncButton";
 *
 * export default function SettingsPage() {
 *   return (
 *     <div>
 *       <h2>Sync Settings</h2>
 *       <p>Sync member data from Whop to update engagement scores</p>
 *       <SyncButton
 *         companyId="biz_xxx"
 *         onSyncComplete={(result) => {
 *           console.log("Sync complete:", result);
 *           // Optionally refresh page data
 *           window.location.reload();
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
