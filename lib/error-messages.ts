/**
 * User-Friendly Error Messages
 * Maps error codes to friendly messages for end users
 */

export const ERROR_CODES = {
	// Authentication errors
	AUTH_REQUIRED: "AUTH_REQUIRED",
	AUTH_INVALID: "AUTH_INVALID",
	ACCESS_DENIED: "ACCESS_DENIED",

	// Whop API errors
	WHOP_API_UNAVAILABLE: "WHOP_API_UNAVAILABLE",
	WHOP_API_ERROR: "WHOP_API_ERROR",
	WHOP_RATE_LIMIT: "WHOP_RATE_LIMIT",
	WHOP_NO_MEMBERS: "WHOP_NO_MEMBERS",

	// Supabase errors
	SUPABASE_ERROR: "SUPABASE_ERROR",
	SUPABASE_CONNECTION: "SUPABASE_CONNECTION",
	SUPABASE_RLS: "SUPABASE_RLS",

	// Sync errors
	SYNC_IN_PROGRESS: "SYNC_IN_PROGRESS",
	SYNC_FAILED: "SYNC_FAILED",
	RATE_LIMIT: "RATE_LIMIT",

	// Webhook errors
	WEBHOOK_INVALID_SIGNATURE: "WEBHOOK_INVALID_SIGNATURE",
	WEBHOOK_PROCESSING_ERROR: "WEBHOOK_PROCESSING_ERROR",

	// General errors
	NETWORK_ERROR: "NETWORK_ERROR",
	TIMEOUT: "TIMEOUT",
	SERVER_ERROR: "SERVER_ERROR",
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	// Authentication
	AUTH_REQUIRED: "Please log in to access this feature.",
	AUTH_INVALID: "Your session has expired. Please refresh the page.",
	ACCESS_DENIED: "You don't have permission to access this data.",

	// Whop API
	WHOP_API_UNAVAILABLE:
		"Could not connect to Whop. Please try again in a moment.",
	WHOP_API_ERROR:
		"There was an issue fetching data from Whop. Please try again.",
	WHOP_RATE_LIMIT:
		"Too many requests to Whop API. Please wait a moment and try again.",
	WHOP_NO_MEMBERS: "No members found in your Whop community.",

	// Supabase
	SUPABASE_ERROR: "Database error occurred. Please try again.",
	SUPABASE_CONNECTION:
		"Could not connect to database. Please check your connection.",
	SUPABASE_RLS: "Database permission error. Please contact support.",

	// Sync
	SYNC_IN_PROGRESS:
		"A sync is already in progress. Please wait for it to complete.",
	SYNC_FAILED:
		"Failed to sync member data. Please check your configuration.",
	RATE_LIMIT: "Please wait 1 minute before syncing again.",

	// Webhooks
	WEBHOOK_INVALID_SIGNATURE:
		"Invalid webhook signature. Please verify webhook configuration.",
	WEBHOOK_PROCESSING_ERROR:
		"Error processing webhook event. The event has been logged.",

	// General
	NETWORK_ERROR: "Network error. Please check your internet connection.",
	TIMEOUT: "Request timed out. Please try again.",
	SERVER_ERROR: "An unexpected server error occurred. Please try again.",
	UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: string, fallback?: string): string {
	return (
		ERROR_MESSAGES[code as ErrorCode] ||
		fallback ||
		ERROR_MESSAGES.UNKNOWN_ERROR
	);
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
	code: ErrorCode,
	customMessage?: string,
	details?: any
) {
	return {
		success: false,
		error: {
			message: customMessage || getErrorMessage(code),
			code,
			details,
		},
	};
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T = any>(data: T, message?: string) {
	return {
		success: true,
		data,
		message,
	};
}

/**
 * Error categories for handling
 */
const AUTH_ERRORS: readonly string[] = [
	ERROR_CODES.AUTH_REQUIRED,
	ERROR_CODES.AUTH_INVALID,
	ERROR_CODES.ACCESS_DENIED,
];

const WHOP_ERRORS: readonly string[] = [
	ERROR_CODES.WHOP_API_UNAVAILABLE,
	ERROR_CODES.WHOP_API_ERROR,
	ERROR_CODES.WHOP_RATE_LIMIT,
];

const SUPABASE_ERRORS: readonly string[] = [
	ERROR_CODES.SUPABASE_ERROR,
	ERROR_CODES.SUPABASE_CONNECTION,
	ERROR_CODES.SUPABASE_RLS,
];

const RETRYABLE_ERRORS: readonly string[] = [
	ERROR_CODES.NETWORK_ERROR,
	ERROR_CODES.TIMEOUT,
	ERROR_CODES.WHOP_API_UNAVAILABLE,
	ERROR_CODES.SUPABASE_CONNECTION,
];

export const ErrorCategory = {
	isAuthError: (code: string) => AUTH_ERRORS.includes(code),
	isWhopError: (code: string) => WHOP_ERRORS.includes(code),
	isSupabaseError: (code: string) => SUPABASE_ERRORS.includes(code),
	isRetryable: (code: string) => RETRYABLE_ERRORS.includes(code),
};
