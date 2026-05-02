import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getD1Database } from "@/lib/db/d1";

export async function GET(request: NextRequest) {
  // Check authentication
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get D1 database from Cloudflare context
    const db = await getD1Database();

    if (!db) {
      console.error("D1 database not available");
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If an ID is provided, fetch a single submission
    if (id) {
      const submission = await db.prepare("SELECT * FROM contact_submissions WHERE id = ?").bind(id).first();

      if (!submission) {
        return NextResponse.json(
          { success: false, error: "Submission not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        submissions: [submission],
        total: 1,
        limit: 1,
        offset: 0,
      });
    }

    // Otherwise, fetch a list of submissions with pagination
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const orderBy = searchParams.get("orderBy") || "created_at";
    const order = searchParams.get("order") || "DESC";

    // Build query
    let query = "SELECT * FROM contact_submissions";
    let countQuery = "SELECT COUNT(*) as count FROM contact_submissions";
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (status && status !== "all") {
      conditions.push("status = ?");
      params.push(status);
    }

    if (search) {
      conditions.push("(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)");
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    // Validate orderBy to prevent SQL injection
    const validOrderBy = ["created_at", "updated_at", "name", "email", "subject", "status", "priority"];
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : "created_at";
    const safeOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    query += ` ORDER BY ${safeOrderBy} ${safeOrder} LIMIT ? OFFSET ?`;

    // Get total count
    const countResult = await db.prepare(countQuery).bind(...params).first<{ count: number }>();

    // Get submissions
    const result = await db.prepare(query).bind(...params, limit, offset).all();

    return NextResponse.json({
      success: true,
      submissions: result.results || [],
      total: countResult?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getD1Database();

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status, priority } = body;
    const now = new Date().toISOString();

    // Build update query dynamically
    const updates: string[] = ["updated_at = ?"];
    const params: unknown[] = [now];

    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }

    if (priority !== undefined) {
      updates.push("priority = ?");
      params.push(priority);
    }

    params.push(id);

    const query = `UPDATE contact_submissions SET ${updates.join(", ")} WHERE id = ?`;
    await db.prepare(query).bind(...params).run();

    return NextResponse.json({
      success: true,
      message: `Submission ${id} updated`,
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getD1Database();

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
    }

    await db.prepare("DELETE FROM contact_submissions WHERE id = ?").bind(id).run();

    return NextResponse.json({
      success: true,
      message: `Submission ${id} deleted`,
    });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete submission" },
      { status: 500 }
    );
  }
}
