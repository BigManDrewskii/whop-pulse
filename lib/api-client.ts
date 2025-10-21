/**
 * API Client with Retry Logic & Error Handling
 * Smart fetch wrapper for robust API calls
 */

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: {
		message: string;
		code: string;
		details?: any;
	};
}

export interface FetchOptions extends RequestInit {
	retries?: number;
	retryDelay?: number;
	timeout?: number;
}

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Smart fetch with automatic retries and error handling
 */
export async function apiClient<T = any>(
	url: string,
	options: FetchOptions = {}
): Promise<ApiResponse<T>> {
	const {
		retries = 3,
		retryDelay = 1000,
		timeout = 30000,
		...fetchOptions
	} = options;

	let lastError: any;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			// Create abort controller for timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const response = await fetch(url, {
					...fetchOptions,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				// Handle rate limiting (429)
				if (response.status === 429) {
					const retryAfter = response.headers.get("Retry-After");
					const waitTime = retryAfter
						? parseInt(retryAfter, 10) * 1000
						: retryDelay * Math.pow(2, attempt); // Exponential backoff

					console.warn(
						`[API Client] Rate limited, waiting ${waitTime}ms before retry...`
					);

					if (attempt < retries) {
						await sleep(waitTime);
						continue; // Retry
					}

					return {
						success: false,
						error: {
							message: "Rate limit exceeded. Please try again in a moment.",
							code: "RATE_LIMIT_EXCEEDED",
							details: { retry_after: waitTime / 1000 },
						},
					};
				}

				// Parse JSON response
				const data = await response.json();

				// Check if response indicates success
				if (response.ok) {
					return {
						success: true,
						data: data.data || data,
					};
				}

				// Server returned error response
				return {
					success: false,
					error: {
						message:
							data.error?.message ||
							data.message ||
							`Request failed with status ${response.status}`,
						code: data.error?.code || `HTTP_${response.status}`,
						details: data.error?.details || data.details,
					},
				};
			} catch (fetchError: any) {
				clearTimeout(timeoutId);

				// Handle timeout
				if (fetchError.name === "AbortError") {
					lastError = {
						message: "Request timed out. Please try again.",
						code: "TIMEOUT",
					};

					if (attempt < retries) {
						console.warn(
							`[API Client] Timeout on attempt ${attempt + 1}, retrying...`
						);
						await sleep(retryDelay * Math.pow(2, attempt));
						continue;
					}
				}

				// Handle network errors
				if (fetchError.message?.includes("fetch failed")) {
					lastError = {
						message: "Network error. Please check your connection.",
						code: "NETWORK_ERROR",
					};

					if (attempt < retries) {
						console.warn(
							`[API Client] Network error on attempt ${attempt + 1}, retrying...`
						);
						await sleep(retryDelay * Math.pow(2, attempt));
						continue;
					}
				}

				// Other fetch errors
				lastError = {
					message: fetchError.message || "An unexpected error occurred",
					code: "FETCH_ERROR",
					details: fetchError,
				};

				if (attempt < retries) {
					await sleep(retryDelay * Math.pow(2, attempt));
					continue;
				}
			}
		} catch (error: any) {
			lastError = {
				message: error.message || "An unexpected error occurred",
				code: "UNKNOWN_ERROR",
				details: error,
			};

			if (attempt < retries) {
				console.warn(
					`[API Client] Error on attempt ${attempt + 1}, retrying...`
				);
				await sleep(retryDelay * Math.pow(2, attempt));
				continue;
			}
		}
	}

	// All retries exhausted
	console.error("[API Client] All retries exhausted:", lastError);

	return {
		success: false,
		error: lastError || {
			message: "Request failed after multiple retries",
			code: "MAX_RETRIES_EXCEEDED",
		},
	};
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
	get: <T = any>(url: string, options?: FetchOptions) =>
		apiClient<T>(url, { ...options, method: "GET" }),

	post: <T = any>(url: string, body?: any, options?: FetchOptions) =>
		apiClient<T>(url, {
			...options,
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...options?.headers,
			},
			body: body ? JSON.stringify(body) : undefined,
		}),

	put: <T = any>(url: string, body?: any, options?: FetchOptions) =>
		apiClient<T>(url, {
			...options,
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...options?.headers,
			},
			body: body ? JSON.stringify(body) : undefined,
		}),

	delete: <T = any>(url: string, options?: FetchOptions) =>
		apiClient<T>(url, { ...options, method: "DELETE" }),
};
