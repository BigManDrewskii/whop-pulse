/**
 * API Request Validation Utilities
 * Validates and sanitizes API requests for security
 */

import { NextRequest } from "next/server";
import { whopSdk } from "./whop-sdk";
import {
	sanitizeCompanyId,
	sanitizeUserId,
	sanitizeApiRequestBody,
} from "./input-sanitizer";
import { createErrorResponse, ERROR_CODES } from "./error-messages";

interface ValidatedRequest {
	userId: string;
	companyId?: string;
	body?: any;
}

/**
 * Validate Whop authentication token from request
 * Returns userId if valid, throws error if invalid
 */
export async function validateWhopAuth(
	request: NextRequest
): Promise<{ userId: string }> {
	try {
		const headers = request.headers;

		// Verify token with Whop SDK
		const token = await whopSdk.verifyUserToken(headers);

		if (!token.userId) {
			throw new Error("No userId in token");
		}

		// Sanitize user ID
		const sanitizedUserId = sanitizeUserId(token.userId);

		if (!sanitizedUserId) {
			throw new Error("Invalid userId format");
		}

		return { userId: sanitizedUserId };
	} catch (error: any) {
		console.error("[API Validator] Auth validation failed:", error);
		throw createErrorResponse(
			ERROR_CODES.AUTH_INVALID,
			"Invalid or expired authentication token"
		);
	}
}

/**
 * Validate request has access to company
 */
export async function validateCompanyAccess(
	userId: string,
	companyId: string
): Promise<boolean> {
	try {
		// Sanitize company ID
		const sanitizedCompanyId = sanitizeCompanyId(companyId);

		if (!sanitizedCompanyId) {
			throw new Error("Invalid companyId format");
		}

		// Check access with Whop
		const accessResult = await whopSdk.access.checkIfUserHasAccessToCompany({
			userId,
			companyId: sanitizedCompanyId,
		});

		return accessResult.hasAccess;
	} catch (error) {
		console.error("[API Validator] Company access check failed:", error);
		return false;
	}
}

/**
 * Validate complete API request (auth + company access + body)
 */
export async function validateApiRequest(
	request: NextRequest,
	requireCompany: boolean = true
): Promise<ValidatedRequest> {
	// 1. Validate authentication
	const { userId } = await validateWhopAuth(request);

	// 2. Get and validate company ID
	let companyId: string | undefined;

	if (requireCompany) {
		// Try to get from query params
		companyId = request.nextUrl.searchParams.get("companyId") || undefined;

		// Try to get from request body
		if (!companyId) {
			try {
				const body = await request.clone().json();
				companyId = body.companyId;
			} catch {
				// No body or invalid JSON
			}
		}

		// Fallback to env var
		if (!companyId) {
			companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || undefined;
		}

		if (!companyId) {
			throw createErrorResponse(
				ERROR_CODES.ACCESS_DENIED,
				"Company ID is required"
			);
		}

		// Validate company access
		const hasAccess = await validateCompanyAccess(userId, companyId);

		if (!hasAccess) {
			throw createErrorResponse(
				ERROR_CODES.ACCESS_DENIED,
				"You don't have access to this company"
			);
		}
	}

	// 3. Validate and sanitize request body
	let body: any;

	if (request.method !== "GET") {
		try {
			const rawBody = await request.json();
			body = sanitizeApiRequestBody(rawBody);
		} catch {
			// No body or invalid JSON - that's okay for some requests
			body = undefined;
		}
	}

	return {
		userId,
		companyId,
		body,
	};
}

/**
 * Rate limit checker
 * Simple in-memory rate limiting (can be enhanced with Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
	key: string,
	maxRequests: number = 60,
	windowMs: number = 60000
): { allowed: boolean; retryAfter?: number } {
	const now = Date.now();
	const record = rateLimitStore.get(key);

	if (!record || record.resetAt < now) {
		// New window
		rateLimitStore.set(key, {
			count: 1,
			resetAt: now + windowMs,
		});
		return { allowed: true };
	}

	if (record.count >= maxRequests) {
		// Rate limit exceeded
		const retryAfter = Math.ceil((record.resetAt - now) / 1000);
		return { allowed: false, retryAfter };
	}

	// Increment count
	record.count++;
	return { allowed: true };
}

/**
 * Cleanup old rate limit records (call periodically)
 */
export function cleanupRateLimits(): void {
	const now = Date.now();
	for (const [key, record] of rateLimitStore.entries()) {
		if (record.resetAt < now) {
			rateLimitStore.delete(key);
		}
	}
}

// Cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
	setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
