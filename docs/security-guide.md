# Security Guide

This document outlines the security measures implemented in the Jacob Barkin Portfolio.

## Authentication & Authorization

### Clerk Authentication
We use **Clerk** for Identity and Access Management (IAM), specifically to protect the Admin Dashboard.
-   **Middleware**: `src/middleware.ts` uses `clerkMiddleware()` to intercept requests to `/admin*`.
-   **Edge Compatible**: Clerk's Edge Middleware runs natively on Cloudflare Workers, ensuring low latency.
-   **Policies**: Public routes are explicitly defined; everything else (admin) requires a session.

## Data Protection

### Database (D1)
-   **Binding**: The D1 database is accessed via a binding (`env.DB`) that is only available within the secure Worker context. it is NOT exposed to the client.
-   **Prepared Statements**: All SQL queries use parameter binding (`?`) to prevent SQL Injection attacks.

### Environment Variables
-   **Client-Side**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser (e.g., Clerk Publishable Key).
-   **Server-Side**: Sensitive keys (Resend API Key, Clerk Secret) are stored in Cloudflare Secrets and accessed via `process.env` or the context binding.

## API Security

### Rate Limiting
-   **Cloudflare WAF**: The application sits behind Cloudflare, providing automatic DDoS protection.
-   **Application Logic**: The contact form logs IP addresses (`contact_submissions.ip_address`), allowing for future rate-limiting logic at the application layer if abuse is detected.

### Validation
-   **Zod**: We use Zod schemas for both Client-side and Server-side validation of all inputs (Contact Form, Embed Analytics). This strictly enforces data shapes and prevents malformed data from reaching the DB.

## Content Security Policy (CSP)

Next.js automatically handles many security headers. We enhance this by:
-   **Strict Strict-Transport-Security (HSTS)**: Enforced by Cloudflare.
-   **X-Content-Type-Options**: `nosniff`.

## Incident Response

If a security vulnerability is discovered:
1.  **Isolate**: If the issue is with the Worker, rollback to a previous deployment via `wrangler rollback`.
2.  **Rotate**: Rotate compromised keys (Clerk, Resend, Cloudflare API Token) immediately.
3.  **Patch**: Push a fix through the CI/CD pipeline.
