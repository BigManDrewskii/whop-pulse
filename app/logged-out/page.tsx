"use client";

/**
 * Logged Out Page
 * Shows after user logs out, then redirects to Whop dashboard
 */

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function LoggedOutPage() {
	const [countdown, setCountdown] = useState(3);

	useEffect(() => {
		// Countdown timer
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					// Redirect to Whop dashboard
					window.top!.location.href = "https://whop.com/dashboard";
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const handleReturnNow = () => {
		window.top!.location.href = "https://whop.com/dashboard";
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
				<div className="text-center">
					{/* Success Icon */}
					<div className="mb-6 flex justify-center">
						<div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
							<CheckCircle className="w-12 h-12 text-green-600" />
						</div>
					</div>

					{/* Title */}
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Logged Out Successfully
					</h1>

					{/* Description */}
					<p className="text-gray-600 mb-6">
						You've been logged out of Pulse. You'll be redirected to your Whop
						dashboard in {countdown} second{countdown !== 1 ? "s" : ""}.
					</p>

					{/* Return Now Button */}
					<button
						onClick={handleReturnNow}
						className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
					>
						Return to Whop Dashboard Now
					</button>

					{/* Info */}
					<div className="mt-6 pt-6 border-t border-gray-200">
						<p className="text-sm text-gray-500">
							To access Pulse again, open it from your Whop dashboard.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
