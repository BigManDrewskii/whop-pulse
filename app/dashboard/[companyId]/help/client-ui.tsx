"use client";

import { useState } from "react";

interface HelpContentProps {
	userName: string;
}

export function HelpContent({ userName }: HelpContentProps) {
	return (
		<div className="space-y-6">
			{/* Getting Started */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">
					Getting Started
				</h2>

				<div className="space-y-4">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							What is Pulse?
						</h3>
						<p className="text-gray-600">
							Pulse is a member activity monitor for your Whop community. It
							tracks member engagement, identifies at-risk members, and helps
							you boost retention with real-time insights and actionable data.
						</p>
					</div>

					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							How to Read Engagement Scores
						</h3>
						<p className="text-gray-600 mb-3">
							Each member has an engagement score from 0-100 based on their
							recent activity. Higher scores indicate more engaged members.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-green-50 border border-green-200 rounded-lg p-4">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-3 h-3 rounded-full bg-green-500" />
									<span className="font-semibold text-green-800">
										Active (80-100)
									</span>
								</div>
								<p className="text-sm text-green-700">
									Highly engaged members who log in regularly
								</p>
							</div>
							<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-3 h-3 rounded-full bg-yellow-500" />
									<span className="font-semibold text-yellow-800">
										At Risk (40-79)
									</span>
								</div>
								<p className="text-sm text-yellow-700">
									Members showing signs of disengagement - reach out now
								</p>
							</div>
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-3 h-3 rounded-full bg-red-500" />
									<span className="font-semibold text-red-800">
										Inactive (0-39)
									</span>
								</div>
								<p className="text-sm text-red-700">
									Members who haven't engaged recently - needs attention
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Features Guide */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">
					Features Guide
				</h2>

				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
							<span className="text-primary-600">🎯</span> How to Use Filters
						</h3>
						<p className="text-gray-600 mb-3">
							Click the filter buttons above the member table to quickly find
							members by status:
						</p>
						<ul className="space-y-2 text-gray-600">
							<li className="flex items-start gap-2">
								<span className="text-primary-600 font-bold mt-1">•</span>
								<span>
									<strong>All:</strong> Shows all members in your community
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-600 font-bold mt-1">•</span>
								<span>
									<strong>Active:</strong> Only shows members with high
									engagement (logged in within 7 days)
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-yellow-600 font-bold mt-1">•</span>
								<span>
									<strong>At Risk:</strong> Shows members who need attention
									(inactive for 8-30 days)
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-red-600 font-bold mt-1">•</span>
								<span>
									<strong>Inactive:</strong> Shows members who haven't engaged
									recently (30+ days)
								</span>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
							<span className="text-primary-600">🔍</span> How to Search Members
						</h3>
						<p className="text-gray-600">
							Use the search bar to find specific members by typing their name,
							email, or username. The search is case-insensitive and updates
							results in real-time as you type.
						</p>
					</div>

					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
							<span className="text-primary-600">⚙️</span> How to Adjust Settings
						</h3>
						<p className="text-gray-600">
							Click the Settings button in the top right corner to customize
							engagement thresholds, configure display options, and access the
							tutorial.
						</p>
					</div>
				</div>
			</div>

			{/* Engagement Score Details */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">
					Engagement Score Details
				</h2>

				<p className="text-gray-600 mb-4">
					Engagement scores are automatically calculated based on how recently a
					member has been active in your community. The algorithm uses a linear
					decay model across three tiers:
				</p>

				<div className="space-y-4">
					<div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
						<h3 className="font-bold text-green-700 mb-2">
							Active (Score 80-100)
						</h3>
						<p className="text-green-800 text-sm mb-2">
							<strong>Timeframe:</strong> Logged in within the last 0-7 days
						</p>
						<p className="text-green-700 text-sm">
							Members in this range are highly engaged. The score decays
							linearly from 100 (active today) to 80 (active 7 days ago).
						</p>
					</div>

					<div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
						<h3 className="font-bold text-yellow-800 mb-2">
							At Risk (Score 40-79)
						</h3>
						<p className="text-yellow-800 text-sm mb-2">
							<strong>Timeframe:</strong> Inactive for 8-30 days
						</p>
						<p className="text-yellow-700 text-sm">
							These members are showing warning signs. The score decays from 79
							(8 days inactive) to 40 (30 days inactive). Reach out to
							re-engage them before they become inactive.
						</p>
					</div>

					<div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
						<h3 className="font-bold text-red-700 mb-2">
							Inactive (Score 0-39)
						</h3>
						<p className="text-red-800 text-sm mb-2">
							<strong>Timeframe:</strong> No activity for 30+ days
						</p>
						<p className="text-red-700 text-sm">
							Members who haven't engaged recently. The score decays from 39
							(31 days) to 0 (60+ days). These members need immediate attention
							to prevent churn.
						</p>
					</div>
				</div>
			</div>

			{/* FAQs */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">
					Frequently Asked Questions
				</h2>
				<FAQAccordion />
			</div>

			{/* Contact Support */}
			<div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-sm p-8 text-center">
				<div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-8 h-8 text-primary-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">
					Need More Help?
				</h2>
				<p className="text-white/90 text-lg mb-6">
					Our team is here to help you succeed
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<a
						href="mailto:support@studiodrewskii.com"
						className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 inline-flex items-center justify-center gap-2"
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
						Email Support
					</a>
					<a
						href="https://discord.gg/your-server"
						className="px-6 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-all duration-200 border-2 border-primary-500 inline-flex items-center justify-center gap-2"
					>
						<svg
							className="w-5 h-5"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
						</svg>
						Join Discord
					</a>
				</div>
				<p className="text-white/75 text-sm mt-4">
					Average response time: 24 hours
				</p>
			</div>
		</div>
	);
}

// FAQ Accordion Component
function FAQAccordion() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const faqs = [
		{
			question: "Why is a member showing as inactive?",
			answer:
				"A member shows as inactive when they haven't logged in or been active in your community for 30+ days. This is based on their last_active_at timestamp from Whop. If you believe this is incorrect, check if they're using a different account or contact Whop support to verify their activity data.",
		},
		{
			question: "Can I customize the engagement thresholds?",
			answer:
				"Yes! Go to Settings and adjust the 'Engagement Thresholds' section. You can customize how many days define Active vs At Risk vs Inactive members. For example, you could set Active to 14 days instead of 7 if your community has weekly engagement patterns. Changes apply immediately to all engagement scores.",
		},
		{
			question: "How often does data update?",
			answer:
				"Member data is fetched in real-time every time you load the dashboard. Engagement scores are calculated on-the-fly based on the latest activity data from Whop's API. There's no caching delay - you always see the most current member engagement status.",
		},
		{
			question: "What should I do with at-risk members?",
			answer:
				"At-risk members are showing early warning signs of disengagement. Best practices: (1) Send a personalized message asking if they need help, (2) Share valuable content they might have missed, (3) Offer incentives for re-engagement, (4) Survey them to understand why they're less active. Early intervention has the highest success rate for retention.",
		},
	];

	return (
		<div className="space-y-3">
			{faqs.map((faq, index) => (
				<div
					key={index}
					className="border border-gray-200 rounded-lg overflow-hidden"
				>
					<button
						onClick={() => setOpenIndex(openIndex === index ? null : index)}
						className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between gap-4"
					>
						<span className="font-semibold text-gray-900">{faq.question}</span>
						<svg
							className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
								openIndex === index ? "rotate-180" : ""
							}`}
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
					</button>
					{openIndex === index && (
						<div className="px-6 py-4 bg-white border-t border-gray-200">
							<p className="text-gray-600 leading-relaxed">{faq.answer}</p>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
