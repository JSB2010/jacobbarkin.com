/**
 * API Route: /api/embed/track
 * Receives tracking events from the credit.js embed script
 */

import { NextRequest, NextResponse } from 'next/server';

// Note: Cloudflare Workers already run at the edge globally,
// so we don't need to specify edge runtime here

// Appwrite REST API configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'contact-form-db';
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_EMBED_COLLECTION_ID || 'embed-analytics';

// CORS headers for cross-origin requests from embedded scripts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// Handle tracking events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { event_type, referrer_url } = body;
    if (!event_type || !referrer_url) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, referrer_url' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate event type
    if (!['impression', 'click'].includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event_type. Must be "impression" or "click"' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Extract domain from referrer URL
    let referrer_domain = 'unknown';
    try {
      referrer_domain = new URL(referrer_url).hostname;
    } catch {
      // Keep as 'unknown' if URL parsing fails
    }

    // Get additional info from headers
    const user_agent = request.headers.get('user-agent') || undefined;
    const country = request.headers.get('cf-ipcountry') || 
                   request.headers.get('x-vercel-ip-country') || 
                   undefined;
    const ip_city = request.headers.get('x-vercel-ip-city') || undefined;
    const ip_region = request.headers.get('x-vercel-ip-country-region') || undefined;

    // Build the event document with all available data
    const eventData = {
      event_type,
      timestamp: new Date().toISOString(),
      referrer_url: referrer_url.substring(0, 2048),
      referrer_domain,
      page_path: body.page_path?.substring(0, 500) || undefined,
      page_title: body.page_title?.substring(0, 200) || undefined,
      variant: body.variant?.substring(0, 20) || 'chip',
      size: body.size?.substring(0, 20) || 'default',
      session_id: body.session_id?.substring(0, 50) || undefined,
      device_type: body.device_type?.substring(0, 20) || undefined,
      browser: body.browser?.substring(0, 30) || undefined,
      user_agent: user_agent?.substring(0, 512),
      screen_width: typeof body.screen_width === 'number' ? body.screen_width : undefined,
      screen_height: typeof body.screen_height === 'number' ? body.screen_height : undefined,
      viewport_width: typeof body.viewport_width === 'number' ? body.viewport_width : undefined,
      viewport_height: typeof body.viewport_height === 'number' ? body.viewport_height : undefined,
      country,
      city: ip_city,
      region: ip_region,
      language: body.language?.substring(0, 10) || undefined,
      timezone: body.timezone?.substring(0, 50) || undefined,
    };

    // Skip tracking if no API key (development without Appwrite)
    if (!APPWRITE_API_KEY) {
      console.log('[Embed Track] No API key, skipping:', eventData);
      return NextResponse.json(
        { success: true, message: 'Tracking disabled (no API key)' },
        { headers: corsHeaders }
      );
    }

    // Create document via Appwrite REST API
    const documentId = `unique()`;
    const appwriteResponse = await fetch(
      `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': APPWRITE_PROJECT_ID,
          'X-Appwrite-Key': APPWRITE_API_KEY,
        },
        body: JSON.stringify({
          documentId,
          data: eventData,
        }),
      }
    );

    if (!appwriteResponse.ok) {
      const errorText = await appwriteResponse.text();
      console.error('[Embed Track] Appwrite error:', errorText);
      return NextResponse.json(
        { success: true, message: 'Event received' },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('[Embed Track] Error:', error);
    return NextResponse.json(
      { success: true, message: 'Event received' },
      { headers: corsHeaders }
    );
  }
}

