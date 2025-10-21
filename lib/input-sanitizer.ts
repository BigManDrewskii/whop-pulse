/**
 * Input Sanitization Utilities
 * Sanitizes user inputs to prevent XSS and injection attacks
 */

/**
 * Sanitize HTML to prevent XSS
 * Strips potentially dangerous HTML tags and attributes
 */
export function sanitizeHtml(input: string): string {
	if (!input) return "";

	// Remove script tags and their content
	let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

	// Remove event handlers (onclick, onerror, etc.)
	sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

	// Remove javascript: URLs
	sanitized = sanitized.replace(/javascript:/gi, "");

	// Remove data: URLs (can be used for XSS)
	sanitized = sanitized.replace(/data:text\/html/gi, "");

	return sanitized;
}

/**
 * Sanitize text for display
 * Escapes HTML entities
 */
export function escapeHtml(text: string): string {
	if (!text) return "";

	const htmlEscapes: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#x27;",
		"/": "&#x2F;",
	};

	return text.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

/**
 * Sanitize email addresses
 * Validates and normalizes email format
 */
export function sanitizeEmail(email: string): string | null {
	if (!email) return null;

	// Basic email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const trimmed = email.trim().toLowerCase();

	if (!emailRegex.test(trimmed)) {
		return null;
	}

	return trimmed;
}

/**
 * Sanitize username
 * Allows only alphanumeric, dash, and underscore
 */
export function sanitizeUsername(username: string): string {
	if (!username) return "";

	// Remove any non-alphanumeric characters except dash and underscore
	return username.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 50);
}

/**
 * Sanitize search query
 * Removes SQL injection attempts and limits length
 */
export function sanitizeSearchQuery(query: string): string {
	if (!query) return "";

	// Remove SQL keywords
	let sanitized = query.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, "");

	// Remove special SQL characters
	sanitized = sanitized.replace(/[;'"\\]/g, "");

	// Limit length
	return sanitized.trim().substring(0, 100);
}

/**
 * Validate and sanitize company ID
 * Ensures it matches Whop company ID format (biz_*)
 */
export function sanitizeCompanyId(companyId: string): string | null {
	if (!companyId) return null;

	// Whop company IDs start with biz_
	if (!companyId.startsWith("biz_")) {
		console.warn(`[Sanitizer] Invalid company ID format: ${companyId}`);
		return null;
	}

	// Remove any non-alphanumeric except underscore
	const sanitized = companyId.replace(/[^a-zA-Z0-9_]/g, "");

	return sanitized;
}

/**
 * Validate and sanitize user ID
 * Ensures it matches Whop user ID format (user_*)
 */
export function sanitizeUserId(userId: string): string | null {
	if (!userId) return null;

	// Whop user IDs start with user_
	if (!userId.startsWith("user_")) {
		console.warn(`[Sanitizer] Invalid user ID format: ${userId}`);
		return null;
	}

	// Remove any non-alphanumeric except underscore
	const sanitized = userId.replace(/[^a-zA-Z0-9_]/g, "");

	return sanitized;
}

/**
 * Sanitize numeric input
 * Ensures input is a valid number within range
 */
export function sanitizeNumber(
	input: any,
	min: number = Number.MIN_SAFE_INTEGER,
	max: number = Number.MAX_SAFE_INTEGER
): number | null {
	const num = Number(input);

	if (isNaN(num)) {
		return null;
	}

	if (num < min || num > max) {
		return null;
	}

	return num;
}

/**
 * Sanitize JSON input
 * Safely parses JSON and validates structure
 */
export function sanitizeJson<T = any>(input: string): T | null {
	try {
		const parsed = JSON.parse(input);

		// Basic protection against prototype pollution
		if (parsed.__proto__ || parsed.constructor || parsed.prototype) {
			console.warn("[Sanitizer] Potential prototype pollution attempt detected");
			return null;
		}

		return parsed as T;
	} catch (error) {
		console.warn("[Sanitizer] Invalid JSON input:", error);
		return null;
	}
}

/**
 * Sanitize object for API requests
 * Removes dangerous properties and validates types
 */
export function sanitizeApiRequestBody(body: any): any {
	if (!body || typeof body !== "object") {
		return body;
	}

	// Remove prototype pollution vectors
	const sanitized = { ...body };
	delete sanitized.__proto__;
	delete sanitized.constructor;
	delete sanitized.prototype;

	// Recursively sanitize nested objects
	Object.keys(sanitized).forEach((key) => {
		if (typeof sanitized[key] === "string") {
			// Don't HTML escape API data, but do trim
			sanitized[key] = sanitized[key].trim();
		} else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
			sanitized[key] = sanitizeApiRequestBody(sanitized[key]);
		}
	});

	return sanitized;
}
