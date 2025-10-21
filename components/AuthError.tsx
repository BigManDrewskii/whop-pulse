/**
 * Auth Error Component
 * User-friendly error messages for authentication failures
 */

import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react";

interface AuthErrorProps {
	type: "invalid_token" | "no_access" | "connection_error" | "expired";
	message?: string;
	onRetry?: () => void;
}

export function AuthError({ type, message, onRetry }: AuthErrorProps) {
	const errorConfig = {
		invalid_token: {
			title: "Authentication Failed",
			description:
				message ||
				"We couldn't verify your Whop authentication. Please try refreshing the page.",
			icon: "🔒",
			showRetry: true,
			showSupport: true,
		},
		no_access: {
			title: "Access Denied",
			description:
				message ||
				"You don't have permission to access this company's data. Please contact your company administrator.",
			icon: "🚫",
			showRetry: false,
			showSupport: true,
		},
		connection_error: {
			title: "Connection Error",
			description:
				message ||
				"Could not connect to Whop services. Please check your internet connection and try again.",
			icon: "🌐",
			showRetry: true,
			showSupport: false,
		},
		expired: {
			title: "Session Expired",
			description:
				message ||
				"Your session has expired. Please refresh the page to log in again.",
			icon: "⏰",
			showRetry: true,
			showSupport: false,
		},
	};

	const config = errorConfig[type];

	const handleRetry = () => {
		if (onRetry) {
			onRetry();
		} else {
			window.location.reload();
		}
	};

	const handleContactSupport = () => {
		// Open Whop support or your support email
		window.open("https://whop.com/dashboard", "_blank");
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
				<div className="text-center">
					{/* Icon */}
					<div className="text-6xl mb-4">{config.icon}</div>

					{/* Title */}
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						{config.title}
					</h1>

					{/* Description */}
					<p className="text-gray-600 mb-6 leading-relaxed">
						{config.description}
					</p>

					{/* Error Details (if development) */}
					{process.env.NODE_ENV === "development" && message && (
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 text-left">
							<p className="text-xs font-mono text-gray-700">{message}</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex flex-col gap-3">
						{config.showRetry && (
							<button
								onClick={handleRetry}
								className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
							>
								<RefreshCw className="w-5 h-5" />
								{onRetry ? "Retry" : "Refresh Page"}
							</button>
						)}

						{config.showSupport && (
							<button
								onClick={handleContactSupport}
								className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
							>
								<ExternalLink className="w-5 h-5" />
								Back to Whop Dashboard
							</button>
						)}
					</div>

					{/* Help Text */}
					<div className="mt-6 pt-6 border-t border-gray-200">
						<p className="text-sm text-gray-500">
							If this problem persists, please contact{" "}
							<a
								href="https://whop.com/dashboard"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary-600 hover:text-primary-700 font-medium"
							>
								Whop Support
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
