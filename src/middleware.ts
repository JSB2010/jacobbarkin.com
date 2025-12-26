import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
]);

// Define public routes that don't require authentication
// Note: sign-up is intentionally excluded - admin accounts are created in Clerk Dashboard
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/projects(.*)",
  "/portfolio-website",
  "/macbook-pro-opencore",
  "/macos-apple-tv",
  "/public-transportation",
  "/raspberry-pi-homelab",
  "/embed(.*)",
  "/api/contact(.*)",
  "/api/embed(.*)",
  "/sign-in(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

