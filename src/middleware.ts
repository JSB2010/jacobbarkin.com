import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
  "/api/embed-analytics(.*)",
  "/api/embed-custom-content(.*)",
  "/api/embed-heartbeat(.*)",
  "/api/embed-report(.*)",
  "/api/embed-rules",
  "/api/embed-rules/preview(.*)",
  "/api/embed-rules/generate-html(.*)",
  "/api/embed-templates(.*)",
]);

function isPublicEmbedRuntimeRoute(req: Request) {
  const url = new URL(req.url);

  if (url.pathname === "/api/embed-rules/evaluate") return true;
  if (url.pathname === "/api/embed-analytics" && (req.method === "POST" || req.method === "OPTIONS")) return true;
  if (url.pathname === "/api/embed-heartbeat" && (req.method === "POST" || req.method === "OPTIONS")) return true;
  if (url.pathname === "/api/embed-custom-content") {
    return req.method === "OPTIONS" || (req.method === "GET" && url.searchParams.get("list") !== "true");
  }

  return false;
}

export default clerkMiddleware(async (auth, req) => {
  if (isPublicEmbedRuntimeRoute(req)) {
    return NextResponse.next();
  }

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
    "/api/embed-rules",
    "/api/embed-rules/preview(.*)",
    "/api/embed-rules/generate-html(.*)",
    "/api/embed-templates(.*)",
  ],
};
