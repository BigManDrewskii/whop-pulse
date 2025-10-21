"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Smart Discover Page Client UI
 * Detects if user is in Whop context and adjusts UI accordingly
 */
export function DiscoverClientUI() {
	const [isInWhop, setIsInWhop] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Detect if we're in Whop iframe or Whop context
		const detectWhopContext = (): boolean => {
			// Check 1: Are we in an iframe?
			const inIframe = window.self !== window.top;

			// Check 2: Does referrer contain whop.com?
			const referrerIsWhop =
				Boolean(document.referrer) && document.referrer.includes("whop.com");

			// Check 3: Check if parent origin is whop.com (safely)
			let parentIsWhop = false;
			try {
				if (window.parent && window.parent.location) {
					parentIsWhop = window.parent.location.hostname.includes("whop.com");
				}
			} catch (e) {
				// Cross-origin iframe - likely Whop
				if (inIframe && referrerIsWhop) {
					parentIsWhop = true;
				}
			}

			const isWhopContext = Boolean(inIframe || parentIsWhop || referrerIsWhop);

			console.log("[Discover] Context detection:", {
				inIframe,
				referrerIsWhop,
				parentIsWhop,
				isWhopContext,
			});

			return isWhopContext;
		};

		setIsInWhop(detectWhopContext());
		setIsLoading(false);
	}, []);

	// Show loading state briefly
	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// If user is already in Whop context, show navigation help
	if (isInWhop) {
		const handleGoBack = () => {
			if (typeof window !== "undefined") {
				window.history.back();
			}
		};

		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="max-w-2xl w-full bg-white rounded-2xl p-12 text-center shadow-xl border border-gray-200">
					{/* Icon with arrow pointing up */}
					<div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg
							className="w-12 h-12 text-primary-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 10l7-7m0 0l7 7m-7-7v18"
							/>
						</svg>
					</div>

					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						You're Viewing the Public Landing Page
					</h1>

					<p className="text-xl text-gray-600 mb-8">
						To access your Pulse dashboard and member data, use the <strong className="text-primary-600">"Dashboard"</strong> button in the navigation bar at the top of this page.
					</p>

					{/* Go Back Button */}
					<button
						onClick={handleGoBack}
						className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
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
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						Go Back
					</button>

					{/* Helpful tip */}
					<div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mt-8">
						<p className="text-blue-800 font-medium text-sm">
							💡 Tip: Look for "Dashboard", "Settings", or "Help" in the navigation bar above.
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Public landing page (user is NOT in Whop context)
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16 md:py-24">
				<div className="max-w-4xl mx-auto text-center">
					<div className="mb-6">
						<span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
							<div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
							Free to Install
						</span>
					</div>
					<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
						Monitor Your Community's
						<br />
						<span className="text-primary-600">Health in Real-Time</span>
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						Track member engagement, identify at-risk members, and boost
						retention with actionable insights for your Whop community.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="https://whop.com/apps/app_kYOQwOZSTaTdhi/install/"
							className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
						>
							Install Pulse →
						</Link>
						<Link
							href="https://whop.com/hub"
							className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-primary-200 hover:border-primary-300 shadow-md hover:shadow-lg"
						>
							Go to My Whop →
						</Link>
						<a
							href="#features"
							className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200"
						>
							Learn More
						</a>
					</div>

					{/* Helper text for existing users */}
					<p className="text-sm text-gray-500 mt-4">
						Already installed Pulse?{" "}
						<Link
							href="https://whop.com/hub"
							className="text-primary-600 hover:underline font-medium"
						>
							Find it in your Whop sidebar
						</Link>
					</p>
				</div>
			</section>

			{/* Features Grid */}
			<section id="features" className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Everything You Need to Track Engagement
						</h2>
						<p className="text-lg text-gray-600">
							Powerful features to keep your community thriving
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Feature 1 */}
						<div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100">
							<div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
								<span className="text-2xl">📊</span>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">
								Engagement Scoring
							</h3>
							<p className="text-gray-600">
								See which members are active, at risk, or inactive with
								automatic engagement scores based on activity patterns.
							</p>
						</div>

						{/* Feature 2 */}
						<div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100">
							<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
								<span className="text-2xl">🎯</span>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">
								Smart Filters
							</h3>
							<p className="text-gray-600">
								Quickly find members who need attention with powerful filtering
								by status, activity, and engagement level.
							</p>
						</div>

						{/* Feature 3 */}
						<div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100">
							<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
								<span className="text-2xl">📈</span>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">
								Activity Tracking
							</h3>
							<p className="text-gray-600">
								Monitor last login times and engagement trends to understand
								member behavior and improve retention.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Screenshot Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					<div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 shadow-2xl">
						<div className="text-center mb-8">
							<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
								Get Instant Insights Into Your Community Health
							</h2>
							<p className="text-white/90 text-lg">
								Beautiful dashboard with all the metrics that matter
							</p>
						</div>

						{/* Screenshot Placeholder */}
						<div className="bg-white rounded-xl p-4 shadow-2xl">
							<div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
								<div className="text-center">
									<div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
										<svg
											className="w-10 h-10 text-white"
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
									</div>
									<p className="text-gray-500 font-medium">
										Dashboard Preview Coming Soon
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							How It Works
						</h2>
						<p className="text-lg text-gray-600">
							Get started in minutes with these simple steps
						</p>
					</div>

					<div className="space-y-8">
						{/* Step 1 */}
						<div className="flex gap-6 items-start">
							<div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
								1
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									Install Pulse
								</h3>
								<p className="text-gray-600">
									Add Pulse to your Whop company with one click. No
									configuration needed - it works out of the box.
								</p>
							</div>
						</div>

						{/* Step 2 */}
						<div className="flex gap-6 items-start">
							<div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
								2
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									View Member Engagement Scores
								</h3>
								<p className="text-gray-600">
									See instant engagement scores for all your members. Filter by
									active, at-risk, or inactive status.
								</p>
							</div>
						</div>

						{/* Step 3 */}
						<div className="flex gap-6 items-start">
							<div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
								3
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									Take Action on At-Risk Members
								</h3>
								<p className="text-gray-600">
									Identify members who haven't been active recently and reach
									out before they churn. Boost your retention rate.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="container mx-auto px-4 py-16 md:py-24">
				<div className="max-w-4xl mx-auto">
					<div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-12 text-center shadow-2xl">
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
							Start Monitoring Your Community
						</h2>
						<p className="text-xl text-white/90 mb-8">
							Join hundreds of Whop creators using Pulse to boost engagement
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Link
								href="https://whop.com/apps/app_kYOQwOZSTaTdhi/install/"
								className="px-10 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
							>
								Install Pulse - It's Free
							</Link>
							<Link
								href="https://whop.com/hub"
								className="px-10 py-4 bg-primary-700 text-white rounded-lg font-bold hover:bg-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
							>
								Go to My Whop →
							</Link>
							<span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700/50 text-white rounded-lg text-sm font-medium">
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								Free to install
							</span>
						</div>

						<p className="text-white/75 text-sm mt-6">
							No credit card required • Install in seconds
						</p>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="container mx-auto px-4 py-8 border-t border-gray-200">
				<div className="text-center text-gray-600 text-sm">
					<p>
						Built with ❤️ for Whop creators by{" "}
						<span className="font-semibold">STUDIO DREWSKII</span>
					</p>
				</div>
			</footer>
		</div>
	);
}
