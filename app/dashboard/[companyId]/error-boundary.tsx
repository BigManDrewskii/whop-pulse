"use client";

/**
 * Error Boundary Component
 * Catches and displays errors in the dashboard
 */

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Dashboard Error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
					<div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
						<div className="text-center">
							<svg
								className="w-16 h-16 text-red-500 mx-auto mb-4"
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
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								Something went wrong
							</h2>
							<p className="text-gray-600 mb-6">
								{this.state.error?.message ||
									"An unexpected error occurred while loading the dashboard."}
							</p>
							<button
								onClick={() => window.location.reload()}
								className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
							>
								Reload Page
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

/**
 * API Error Component
 * Displays user-friendly error messages for API failures
 */
export function APIErrorDisplay({ error }: { error: string }) {
	const handleRetry = () => {
		window.location.reload();
	};

	return (
		<div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
			<div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
				<div className="text-center">
					<svg
						className="w-16 h-16 text-yellow-500 mx-auto mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Unable to Load Data
					</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<button
						onClick={handleRetry}
						className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
					>
						Reload Page
					</button>
				</div>
			</div>
		</div>
	);
}
