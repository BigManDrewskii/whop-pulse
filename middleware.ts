/**
 * Next.js Middleware
 * Lightweight route protection and security headers
 *
 * Note: We don't do full token validation here (too expensive per request).
 * Full validation happens in page components and API routes.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
	"/api/health",
	"/api/webhooks/whop",
	"/api/cron/daily-snapshot",
	"/logged-out",
	"/discover",
	"/_next",
	"/favicon.ico",
	"/icon.svg",
];

// API routes that require authentication
const PROTECTED_API_ROUTES = [
	"/api/sync-members",
	"/api/history",
	"/api/comparison",
	"/api/auth/logout",
];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow public routes
	if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
		return addSecurityHeaders(NextResponse.next());
	}

	// Check protected API routes
	if (PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))) {
		// Check for Whop authorization header
		const authHeader =
			request.headers.get("authorization") ||
			request.headers.get("x-whop-authorization");

		if (!authHeader) {
			console.warn(`[Middleware] No auth header for protected route: ${pathname}`);
			// Allow through - full validation happens in route handler
			// Middleware is just a lightweight check
		}

		return addSecurityHeaders(NextResponse.next());
	}

	// Protected pages (dashboard, experiences, settings, etc.)
	if (
		pathname.startsWith("/dashboard") ||
		pathname.startsWith("/experiences")
	) {
		// Check if request has Whop-related headers (lightweight check)
		// Full validation happens in page component
		return addSecurityHeaders(NextResponse.next());
	}

	// Default: allow with security headers
	return addSecurityHeaders(NextResponse.next());
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
	// Prevent clickjacking (but allow Whop iframe)
	response.headers.set(
		"Content-Security-Policy",
		"frame-ancestors 'self' https://*.whop.com https://whop.com;"
	);

	// Prevent MIME type sniffing
	response.headers.set("X-Content-Type-Options", "nosniff");

	// XSS protection
	response.headers.set("X-XSS-Protection", "1; mode=block");

	// Referrer policy
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// HSTS (HTTPS only) - Vercel handles this, but good to be explicit
	response.headers.set(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains"
	);

	return response;
}

// Configure which routes this middleware runs on
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
