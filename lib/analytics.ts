/**
 * Analytics & Event Tracking
 * Tracks key events for monitoring and debugging
 * Can be extended to send to PostHog, Mixpanel, etc.
 */

export type EventName =
	| "sync_started"
	| "sync_completed"
	| "sync_failed"
	| "webhook_received"
	| "webhook_processed"
	| "webhook_failed"
	| "snapshot_created"
	| "snapshot_failed"
	| "page_loaded"
	| "error_occurred"
	| "user_action";

export interface EventProperties {
	[key: string]: string | number | boolean | null | undefined;
}

interface PerformanceMetrics {
	duration_ms: number;
	success: boolean;
	error_code?: string;
}

/**
 * Track an analytics event
 */
export function trackEvent(
	eventName: EventName,
	properties?: EventProperties
): void {
	const timestamp = new Date().toISOString();
	const eventData = {
		event: eventName,
		timestamp,
		...properties,
	};

	// Log to console (always, for debugging)
	console.log(
		`[Analytics] ${eventName}`,
		properties ? JSON.stringify(properties, null, 2) : ""
	);

	// TODO: Send to external analytics service
	// Example integrations:
	//
	// PostHog:
	// if (typeof window !== 'undefined' && window.posthog) {
	//   window.posthog.capture(eventName, properties);
	// }
	//
	// Google Analytics:
	// if (typeof window !== 'undefined' && window.gtag) {
	//   window.gtag('event', eventName, properties);
	// }
	//
	// Mixpanel:
	// if (typeof window !== 'undefined' && window.mixpanel) {
	//   window.mixpanel.track(eventName, properties);
	// }

	// Server-side: Could send to logging service
	// if (typeof window === 'undefined') {
	//   await fetch('https://your-logging-service.com/events', {
	//     method: 'POST',
	//     body: JSON.stringify(eventData)
	//   });
	// }
}

/**
 * Track performance metrics
 */
export function trackPerformance(
	operation: string,
	metrics: PerformanceMetrics
): void {
	trackEvent("user_action", {
		operation,
		duration_ms: metrics.duration_ms,
		success: metrics.success,
		error_code: metrics.error_code,
	});

	// Log performance warning if slow
	if (metrics.duration_ms > 5000) {
		console.warn(
			`[Performance] ${operation} took ${metrics.duration_ms}ms (> 5s)`
		);
	}
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, properties?: EventProperties): void {
	trackEvent("page_loaded", {
		page: pageName,
		...properties,
	});
}

/**
 * Track error
 */
export function trackError(
	errorCode: string,
	errorMessage: string,
	context?: EventProperties
): void {
	trackEvent("error_occurred", {
		error_code: errorCode,
		error_message: errorMessage,
		...context,
	});

	// Always log errors to console
	console.error(
		`[Error] ${errorCode}: ${errorMessage}`,
		context ? context : ""
	);
}

/**
 * Track sync operations
 */
export const syncAnalytics = {
	started: (companyId: string) => {
		trackEvent("sync_started", { company_id: companyId });
	},

	completed: (companyId: string, memberCount: number, duration: number) => {
		trackEvent("sync_completed", {
			company_id: companyId,
			member_count: memberCount,
			duration_ms: duration,
		});

		trackPerformance("member_sync", {
			duration_ms: duration,
			success: true,
		});
	},

	failed: (companyId: string, errorCode: string, errorMessage: string) => {
		trackEvent("sync_failed", {
			company_id: companyId,
			error_code: errorCode,
			error_message: errorMessage,
		});

		trackError(errorCode, errorMessage, { company_id: companyId });
	},
};

/**
 * Track webhook operations
 */
export const webhookAnalytics = {
	received: (eventType: string, memberId?: string) => {
		trackEvent("webhook_received", {
			event_type: eventType,
			member_id: memberId,
		});
	},

	processed: (eventType: string, duration: number) => {
		trackEvent("webhook_processed", {
			event_type: eventType,
			duration_ms: duration,
		});

		if (duration > 1000) {
			console.warn(`[Webhook] ${eventType} took ${duration}ms (slow!)`);
		}
	},

	failed: (eventType: string, errorCode: string) => {
		trackEvent("webhook_failed", {
			event_type: eventType,
			error_code: errorCode,
		});
	},
};

/**
 * Track snapshot operations
 */
export const snapshotAnalytics = {
	created: (companyId: string, snapshotCount: number, duration: number) => {
		trackEvent("snapshot_created", {
			company_id: companyId,
			snapshot_count: snapshotCount,
			duration_ms: duration,
		});

		trackPerformance("daily_snapshot", {
			duration_ms: duration,
			success: true,
		});
	},

	failed: (companyId: string, errorCode: string) => {
		trackEvent("snapshot_failed", {
			company_id: companyId,
			error_code: errorCode,
		});
	},
};
