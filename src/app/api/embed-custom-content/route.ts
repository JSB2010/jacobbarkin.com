import { NextRequest, NextResponse } from 'next/server';
import { getD1Database } from '@/lib/db/d1';
import { auth } from '@clerk/nextjs/server';

// CORS headers for public GET endpoint
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CustomContentRow {
  id: string;
  url_pattern: string;
  match_type: string;
  content_html: string;
  preset_type: string | null;
  custom_text: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET - Check if there's custom content for the current URL (public)
// OR list all custom content rules (admin only, with ?list=true)
// Query params: url, host, path OR list=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listAll = searchParams.get('list') === 'true';

    // Admin endpoint: list all rules
    if (listAll) {
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const db = await getD1Database();
      if (!db) {
        // In development without D1, return empty list
        return NextResponse.json({ rules: [] });
      }

      const results = await db.prepare(`
        SELECT * FROM embed_custom_content 
        ORDER BY created_at DESC
      `).all<CustomContentRow>();

      return NextResponse.json({ rules: results.results || [] });
    }

    // Public endpoint: check for matching custom content
    const url = searchParams.get('url') || '';
    const host = searchParams.get('host') || '';
    const path = searchParams.get('path') || '';

    const db = await getD1Database();
    if (!db) {
      // In development without D1, return no match
      return NextResponse.json({ match: false }, { headers: corsHeaders });
    }

    // Try to find a matching custom content rule
    // Priority: exact URL match > domain match > regex match
    
    // 1. Try exact URL match
    const exactMatch = await db.prepare(`
      SELECT * FROM embed_custom_content 
      WHERE match_type = 'exact' 
        AND url_pattern = ? 
        AND is_active = 1
      LIMIT 1
    `).bind(url).first<CustomContentRow>();

    if (exactMatch) {
      return NextResponse.json({
        match: true,
        content_html: exactMatch.content_html,
        preset_type: exactMatch.preset_type,
      }, { headers: corsHeaders });
    }

    // 2. Try domain match (any page on this domain)
    const domainMatch = await db.prepare(`
      SELECT * FROM embed_custom_content 
      WHERE match_type = 'domain' 
        AND url_pattern = ? 
        AND is_active = 1
      LIMIT 1
    `).bind(host).first<CustomContentRow>();

    if (domainMatch) {
      return NextResponse.json({
        match: true,
        content_html: domainMatch.content_html,
        preset_type: domainMatch.preset_type,
      }, { headers: corsHeaders });
    }

    // 3. Try regex matches
    const regexMatches = await db.prepare(`
      SELECT * FROM embed_custom_content 
      WHERE match_type = 'regex' 
        AND is_active = 1
    `).all<CustomContentRow>();

    if (regexMatches.results) {
      for (const rule of regexMatches.results) {
        try {
          const pattern = new RegExp(rule.url_pattern);
          if (pattern.test(url)) {
            return NextResponse.json({
              match: true,
              content_html: rule.content_html,
              preset_type: rule.preset_type,
            }, { headers: corsHeaders });
          }
        } catch (err) {
          // Invalid regex, skip
          console.error('Invalid regex pattern:', rule.url_pattern, err);
        }
      }
    }

    // No match found
    return NextResponse.json({
      match: false,
    }, { headers: corsHeaders });

  } catch (error: unknown) {
    console.error('Error checking custom content:', error);
    return NextResponse.json({
      match: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500, headers: corsHeaders });
  }
}

// POST - Create new custom content rule (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url_pattern, match_type, content_html, preset_type, custom_text } = body;

    if (!url_pattern || !match_type || !content_html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate match_type
    if (!['exact', 'domain', 'regex'].includes(match_type)) {
      return NextResponse.json({ error: 'Invalid match_type' }, { status: 400 });
    }

    // Test regex pattern if match_type is regex
    if (match_type === 'regex') {
      try {
        new RegExp(url_pattern);
      } catch (err) {
        return NextResponse.json({ error: 'Invalid regex pattern' }, { status: 400 });
      }
    }

    const db = await getD1Database();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }
    const id = `cc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    await db.prepare(`
      INSERT INTO embed_custom_content (
        id, url_pattern, match_type, content_html, preset_type, custom_text, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).bind(id, url_pattern, match_type, content_html, preset_type || null, custom_text || null).run();

    return NextResponse.json({ success: true, id }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating custom content:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// PUT - Update custom content rule (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, url_pattern, match_type, content_html, preset_type, custom_text, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Validate match_type if provided
    if (match_type && !['exact', 'domain', 'regex'].includes(match_type)) {
      return NextResponse.json({ error: 'Invalid match_type' }, { status: 400 });
    }

    // Test regex pattern if match_type is regex
    if (match_type === 'regex' && url_pattern) {
      try {
        new RegExp(url_pattern);
      } catch (err) {
        return NextResponse.json({ error: 'Invalid regex pattern' }, { status: 400 });
      }
    }

    const db = await getD1Database();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const bindings: (string | number | null)[] = [];

    if (url_pattern !== undefined) {
      updates.push('url_pattern = ?');
      bindings.push(url_pattern);
    }
    if (match_type !== undefined) {
      updates.push('match_type = ?');
      bindings.push(match_type);
    }
    if (content_html !== undefined) {
      updates.push('content_html = ?');
      bindings.push(content_html);
    }
    if (preset_type !== undefined) {
      updates.push('preset_type = ?');
      bindings.push(preset_type);
    }
    if (custom_text !== undefined) {
      updates.push('custom_text = ?');
      bindings.push(custom_text);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      bindings.push(is_active ? 1 : 0);
    }

    updates.push("updated_at = datetime('now')");
    bindings.push(id);

    await db.prepare(`
      UPDATE embed_custom_content 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...bindings).run();

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Error updating custom content:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// DELETE - Remove custom content rule (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const db = await getD1Database();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    await db.prepare(`
      DELETE FROM embed_custom_content WHERE id = ?
    `).bind(id).run();

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Error deleting custom content:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
