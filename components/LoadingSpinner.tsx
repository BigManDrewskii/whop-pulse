/**
 * Loading Spinner Component
 * Reusable loading indicator for async operations
 */

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	text?: string;
	className?: string;
}

export function LoadingSpinner({
	size = "md",
	text,
	className = "",
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-8 h-8",
		lg: "w-12 h-12",
	};

	const textSizeClasses = {
		sm: "text-sm",
		md: "text-base",
		lg: "text-lg",
	};

	return (
		<div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
			<div
				className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
			/>
			{text && (
				<p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
					{text}
				</p>
			)}
		</div>
	);
}

/**
 * Full Page Loading Component
 * For page-level loading states
 */
export function PageLoading({ text = "Loading..." }: { text?: string }) {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<LoadingSpinner size="lg" text={text} />
		</div>
	);
}

/**
 * Button Loading Spinner
 * Small spinner for buttons
 */
export function ButtonSpinner() {
	return (
		<svg
			className="animate-spin h-5 w-5 text-white"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}
