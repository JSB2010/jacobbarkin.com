/**
 * Contact Form Submissions Database Service
 *
 * This module provides CRUD operations for contact form submissions
 * using Cloudflare D1 database.
 */

import { z } from "zod";

// D1Database type for Cloudflare Workers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D1Database = any;

// Contact form submission schema
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Submission status type
export type SubmissionStatus = "new" | "read" | "replied" | "archived";

// Full submission type (includes database fields)
export interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: SubmissionStatus;
  priority: number;
  created_at: string;
  updated_at: string;
  ip_address: string | null;
  user_agent: string | null;
  source: string;
}

// Alias for backward compatibility
export type ContactSubmission = Submission;

// Generate a unique ID
function generateId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new contact form submission
 */
export async function createSubmission(
  db: D1Database,
  data: ContactFormData,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    source?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = generateId();
    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO contact_submissions (id, name, email, subject, message, status, priority, created_at, updated_at, ip_address, user_agent, source)
         VALUES (?, ?, ?, ?, ?, 'new', 1, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.name,
        data.email,
        data.subject || "Contact Form Submission",
        data.message,
        now,
        now,
        metadata?.ipAddress || null,
        metadata?.userAgent || null,
        metadata?.source || "website_contact_form"
      )
      .run();

    return { success: true, id };
  } catch (error) {
    console.error("Error creating submission:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all submissions with optional pagination and filtering
 */
export async function getSubmissions(
  db: D1Database,
  options?: {
    limit?: number;
    offset?: number;
    status?: SubmissionStatus;
    orderBy?: "created_at" | "updated_at" | "priority";
    order?: "ASC" | "DESC";
  }
): Promise<{ success: boolean; submissions: Submission[]; total: number; error?: string }> {
  try {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const orderBy = options?.orderBy || "created_at";
    const order = options?.order || "DESC";

    let query = "SELECT * FROM contact_submissions";
    let countQuery = "SELECT COUNT(*) as count FROM contact_submissions";
    const params: (string | number)[] = [];

    if (options?.status) {
      query += " WHERE status = ?";
      countQuery += " WHERE status = ?";
      params.push(options.status);
    }

    query += ` ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`;

    // Get total count
    const countResult = await db
      .prepare(countQuery)
      .bind(...params)
      .first() as { count: number } | null;

    // Get submissions
    const result = await db
      .prepare(query)
      .bind(...params, limit, offset)
      .all() as { results: Submission[] };

    return {
      success: true,
      submissions: result.results || [],
      total: countResult?.count || 0,
    };
  } catch (error) {
    console.error("Error getting submissions:", error);
    return {
      success: false,
      submissions: [],
      total: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single submission by ID
 */
export async function getSubmissionById(
  db: D1Database,
  id: string
): Promise<{ success: boolean; submission?: Submission; error?: string }> {
  try {
    const result = await db
      .prepare("SELECT * FROM contact_submissions WHERE id = ?")
      .bind(id)
      .first() as Submission | null;

    if (!result) {
      return { success: false, error: "Submission not found" };
    }

    return { success: true, submission: result };
  } catch (error) {
    console.error("Error getting submission:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update submission status
 */
export async function updateSubmissionStatus(
  db: D1Database,
  id: string,
  status: SubmissionStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();

    const result = await db
      .prepare(
        "UPDATE contact_submissions SET status = ?, updated_at = ? WHERE id = ?"
      )
      .bind(status, now, id)
      .run();

    if (result.meta.changes === 0) {
      return { success: false, error: "Submission not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating submission status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update submission priority
 */
export async function updateSubmissionPriority(
  db: D1Database,
  id: string,
  priority: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (priority < 1 || priority > 5) {
      return { success: false, error: "Priority must be between 1 and 5" };
    }

    const now = new Date().toISOString();

    const result = await db
      .prepare(
        "UPDATE contact_submissions SET priority = ?, updated_at = ? WHERE id = ?"
      )
      .bind(priority, now, id)
      .run();

    if (result.meta.changes === 0) {
      return { success: false, error: "Submission not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating submission priority:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a submission
 */
export async function deleteSubmission(
  db: D1Database,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await db
      .prepare("DELETE FROM contact_submissions WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return { success: false, error: "Submission not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting submission:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get submission statistics
 */
export async function getSubmissionStats(db: D1Database): Promise<{
  success: boolean;
  stats?: {
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
  };
  error?: string;
}> {
  try {
    const result = await db
      .prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
          SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read,
          SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied,
          SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived
        FROM contact_submissions`
      )
      .first() as {
        total: number;
        new: number;
        read: number;
        replied: number;
        archived: number;
      } | null;

    return {
      success: true,
      stats: result || { total: 0, new: 0, read: 0, replied: 0, archived: 0 },
    };
  } catch (error) {
    console.error("Error getting submission stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

