/**
 * Loading Skeleton Components
 * Reusable loading states for better UX
 */

export function DashboardSkeleton() {
	return (
		<div className="min-h-screen bg-background p-4 md:p-8 animate-pulse">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header Skeleton */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="space-y-2">
						<div className="h-8 w-64 bg-gray-200 rounded" />
						<div className="h-4 w-48 bg-gray-200 rounded" />
					</div>
					<div className="flex gap-2">
						<div className="h-10 w-24 bg-gray-200 rounded" />
						<div className="h-10 w-24 bg-gray-200 rounded" />
					</div>
				</div>

				{/* Chart Skeleton */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="h-6 w-48 bg-gray-200 rounded mb-4" />
					<div className="h-64 bg-gray-100 rounded" />
				</div>

				{/* Stats Skeleton */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
						>
							<div className="h-4 w-24 bg-gray-200 rounded mb-4" />
							<div className="h-8 w-16 bg-gray-200 rounded" />
						</div>
					))}
				</div>

				{/* Table Skeleton */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="flex items-center gap-4">
								<div className="w-10 h-10 bg-gray-200 rounded-full" />
								<div className="flex-1 space-y-2">
									<div className="h-4 w-48 bg-gray-200 rounded" />
									<div className="h-3 w-32 bg-gray-200 rounded" />
								</div>
								<div className="h-8 w-16 bg-gray-200 rounded" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<div className="animate-pulse space-y-4">
			{[...Array(rows)].map((_, i) => (
				<div key={i} className="flex items-center gap-4">
					<div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
					<div className="flex-1 space-y-2">
						<div className="h-4 bg-gray-200 rounded w-3/4" />
						<div className="h-3 bg-gray-200 rounded w-1/2" />
					</div>
					<div className="h-8 w-16 bg-gray-200 rounded" />
				</div>
			))}
		</div>
	);
}

export function ChartSkeleton() {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
			<div className="flex justify-between items-center mb-4">
				<div className="h-6 w-48 bg-gray-200 rounded" />
				<div className="h-8 w-32 bg-gray-200 rounded" />
			</div>
			<div className="h-64 bg-gray-100 rounded flex items-center justify-center">
				<div className="text-gray-400 text-sm">Loading chart...</div>
			</div>
		</div>
	);
}

export function StatCardSkeleton() {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
			<div className="h-4 w-24 bg-gray-200 rounded mb-4" />
			<div className="h-8 w-16 bg-gray-200 rounded" />
		</div>
	);
}

export function ComparisonSkeleton() {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
			<div className="h-6 w-48 bg-gray-200 rounded mb-6" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				{[...Array(5)].map((_, i) => (
					<div key={i} className="bg-gray-50 rounded-lg p-4">
						<div className="h-3 w-20 bg-gray-200 rounded mb-3" />
						<div className="h-8 w-12 bg-gray-200 rounded mb-2" />
						<div className="h-4 w-16 bg-gray-200 rounded" />
					</div>
				))}
			</div>
		</div>
	);
}

export function SettingsSkeleton() {
	return (
		<div className="space-y-6 animate-pulse">
			{[...Array(3)].map((_, i) => (
				<div
					key={i}
					className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
				>
					<div className="h-6 w-48 bg-gray-200 rounded mb-4" />
					<div className="space-y-3">
						<div className="h-10 bg-gray-100 rounded" />
						<div className="h-10 bg-gray-100 rounded" />
						<div className="h-10 w-32 bg-gray-200 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}
