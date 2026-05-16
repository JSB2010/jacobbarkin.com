import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
  "/api/embed-analytics(.*)",
  "/api/embed-custom-content(.*)",
  "/api/embed-heartbeat(.*)",
  "/api/embed-report(.*)",
  "/api/embed-rules(.*)",
  "/api/embed-templates(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/admin(.*)",
    "/api/admin(.*)",
    "/api/embed-analytics(.*)",
    "/api/embed-custom-content(.*)",
    "/api/embed-heartbeat(.*)",
    "/api/embed-report(.*)",
    "/api/embed-rules(.*)",
    "/api/embed-templates(.*)",
  ],
};
