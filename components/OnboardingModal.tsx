"use client";

import { useState } from "react";

interface OnboardingModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
	const [currentStep, setCurrentStep] = useState(0);

	if (!isOpen) return null;

	const steps = [
		{
			title: "Welcome to Pulse!",
			description:
				"Your all-in-one member activity monitor for Whop. Track engagement, identify at-risk members, and boost retention with real-time insights.",
			icon: (
				<svg
					className="w-16 h-16 text-primary-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			),
			gradient: "from-primary-500 to-primary-600",
		},
		{
			title: "Understanding Engagement Scores",
			description:
				"Members are automatically scored based on their last activity. Active (80-100) logged in within 7 days. At Risk (40-79) haven't logged in for 8-30 days. Inactive (0-39) haven't logged in for 30+ days.",
			icon: (
				<svg
					className="w-16 h-16 text-green-500"
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
			),
			gradient: "from-green-500 to-green-600",
		},
		{
			title: "Take Action",
			description:
				"Use the filter buttons to quickly find Active, At Risk, or Inactive members. Search by name or email to find specific members. Click column headers to sort by score, status, or last active date.",
			icon: (
				<svg
					className="w-16 h-16 text-purple-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
					/>
				</svg>
			),
			gradient: "from-purple-500 to-purple-600",
		},
	];

	const currentStepData = steps[currentStep];
	const isLastStep = currentStep === steps.length - 1;

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleComplete = () => {
		// Note: localStorage removed for iframe compatibility (Whop environment)
		// Onboarding state is managed in parent component via React state
		onClose();
		setCurrentStep(0); // Reset for next time
	};

	return (
		<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
				>
					<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</button>

				{/* Content */}
				<div className="p-8 md:p-12">
					{/* Icon/Image */}
					<div
						className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center`}
					>
						{currentStepData.icon}
					</div>

					{/* Title */}
					<h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
						{currentStepData.title}
					</h2>

					{/* Description */}
					<p className="text-lg text-gray-600 mb-8 text-center leading-relaxed">
						{currentStepData.description}
					</p>

					{/* Progress Dots */}
					<div className="flex justify-center gap-2 mb-8">
						{steps.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentStep(index)}
								className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
									index === currentStep
										? "bg-primary-600 w-8"
										: index < currentStep
											? "bg-primary-400"
											: "bg-gray-300"
								}`}
							/>
						))}
					</div>

					{/* Buttons */}
					<div className="flex gap-4">
						{currentStep > 0 && (
							<button
								onClick={handlePrevious}
								className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
							>
								Previous
							</button>
						)}
						{isLastStep ? (
							<button
								onClick={handleComplete}
								className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg"
							>
								Get Started →
							</button>
						) : (
							<button
								onClick={handleNext}
								className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200"
							>
								Next →
							</button>
						)}
					</div>

					{/* Skip Link */}
					<div className="text-center mt-4">
						<button
							onClick={onClose}
							className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
						>
							Skip tutorial
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
