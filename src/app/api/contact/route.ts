import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendAdminNotification } from "@/lib/resend";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Type for D1 database
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<{ meta: { changes: number } }>;
}

// Cloudflare env type
interface CloudflareEnv {
  DB: D1Database;
}

// Helper to get D1 database from Cloudflare context
async function getD1Database(): Promise<D1Database | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context as unknown as { env: CloudflareEnv }).env;
    return env?.DB || null;
  } catch {
    return null;
  }
}

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  userAgent: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message, userAgent, source } = validationResult.data;

    // Get client IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";

    // Generate a unique ID for this submission
    const submissionId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Save to D1 database
    const db = await getD1Database();
    if (db) {
      try {
        await db.prepare(`
          INSERT INTO contact_submissions (id, name, email, subject, message, status, priority, created_at, updated_at, ip_address, user_agent, source)
          VALUES (?, ?, ?, ?, ?, 'new', 1, ?, ?, ?, ?, ?)
        `).bind(
          submissionId,
          name,
          email,
          subject,
          message,
          timestamp,
          timestamp,
          ip,
          userAgent || "unknown",
          source || "website_contact_form"
        ).run();
        console.log("Contact submission saved to D1:", submissionId);
      } catch (dbError) {
        console.error("Failed to save to D1:", dbError);
        // Continue anyway - email notification will still be sent
      }
    } else {
      console.warn("D1 database not available - submission not saved to database");
    }

    // Send email notification
    const emailResult = await sendAdminNotification({
      name,
      email,
      subject,
      message,
      timestamp,
      ipAddress: ip,
      userAgent: userAgent || "unknown",
      source: source || "website_contact_form",
    });

    if (!emailResult.success) {
      console.error("Failed to send email notification:", emailResult.error);
      // Don't fail the request if email fails - the submission was still recorded
    }

    return NextResponse.json({
      success: true,
      id: submissionId,
      message: "Thank you for your message. We'll get back to you soon!",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

