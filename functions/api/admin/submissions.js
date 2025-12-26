// Cloudflare Pages Function for admin submissions API
// Uses Cloudflare D1 for storage

// CORS headers for cross-origin requests
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Handle OPTIONS request for CORS preflight
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers
  });
}

export async function onRequest(context) {
  // Handle CORS preflight request
  if (context.request.method === 'OPTIONS') {
    return handleOptions();
  }

  const db = context.env.DB;
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');

  // GET - Fetch submissions
  if (context.request.method === 'GET') {
    try {
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      const status = url.searchParams.get('status');
      const search = url.searchParams.get('search');
      const orderBy = url.searchParams.get('orderBy') || 'created_at';
      const order = url.searchParams.get('order') || 'DESC';

      // Build query
      let query = 'SELECT * FROM contact_submissions';
      let countQuery = 'SELECT COUNT(*) as count FROM contact_submissions';
      const params = [];
      const conditions = [];

      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }

      if (search) {
        conditions.push('(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)');
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
      }

      // Validate orderBy to prevent SQL injection
      const validOrderBy = ['created_at', 'updated_at', 'name', 'email', 'subject', 'status', 'priority'];
      const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'created_at';
      const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      query += ` ORDER BY ${safeOrderBy} ${safeOrder} LIMIT ? OFFSET ?`;

      // Get total count
      const countResult = await db.prepare(countQuery).bind(...params).first();

      // Get submissions
      const result = await db.prepare(query).bind(...params, limit, offset).all();

      return new Response(
        JSON.stringify({
          success: true,
          submissions: result.results || [],
          total: countResult?.count || 0,
          limit,
          offset
        }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers }
      );
    }
  }

  // DELETE - Delete a submission
  if (context.request.method === 'DELETE') {
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing submission ID' }),
        { status: 400, headers }
      );
    }

    try {
      const result = await db.prepare('DELETE FROM contact_submissions WHERE id = ?').bind(id).run();

      if (result.meta.changes === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Submission not found' }),
          { status: 404, headers }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Submission deleted' }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error('Error deleting submission:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers }
      );
    }
  }

  // PATCH - Update submission status
  if (context.request.method === 'PATCH') {
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing submission ID' }),
        { status: 400, headers }
      );
    }

    try {
      const data = await context.request.json();
      const { status, priority } = data;
      const now = new Date().toISOString();

      let updateQuery = 'UPDATE contact_submissions SET updated_at = ?';
      const params = [now];

      if (status) {
        updateQuery += ', status = ?';
        params.push(status);
      }

      if (priority !== undefined) {
        updateQuery += ', priority = ?';
        params.push(priority);
      }

      updateQuery += ' WHERE id = ?';
      params.push(id);

      const result = await db.prepare(updateQuery).bind(...params).run();

      if (result.meta.changes === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Submission not found' }),
          { status: 404, headers }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Submission updated' }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error('Error updating submission:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers }
  );
}

