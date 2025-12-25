/**
 * API Route: /api/embed/analytics
 * Returns analytics summary for the embed dashboard
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

interface EmbedEvent {
  event_type: 'impression' | 'click';
  referrer_url: string;
  referrer_domain: string;
  timestamp: string;
  page_path?: string;
  page_title?: string;
  variant?: string;
  size?: string;
  session_id?: string;
  device_type?: string;
  browser?: string;
  country?: string;
  city?: string;
  screen_width?: number;
  screen_height?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30', 10);

  // Calculate start date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTimestamp = startDate.toISOString();

  if (!APPWRITE_API_KEY) {
    return NextResponse.json({
      error: 'Analytics not configured',
      totalImpressions: 0,
      totalClicks: 0,
      clickThroughRate: 0,
      uniqueSessions: 0,
      topDomains: [],
      topPages: [],
      recentEvents: [],
      dailyStats: [],
      deviceBreakdown: [],
      browserBreakdown: [],
      countryBreakdown: [],
    });
  }

  try {
    // Fetch documents from Appwrite
    const queries = [
      JSON.stringify({ method: 'limit', values: [5000] }),
    ];

    const queryParams = queries.map(q => `queries[]=${encodeURIComponent(q)}`).join('&');
    const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?${queryParams}`;

    const response = await fetch(url, {
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Embed Analytics] Appwrite error:', errorText);
      throw new Error('Failed to fetch from Appwrite');
    }

    const result = await response.json();
    const allEvents: EmbedEvent[] = result.documents || [];

    // Filter by date in JavaScript
    const events = allEvents.filter(e => e.timestamp >= startTimestamp);

    // Calculate totals
    const impressions = events.filter(e => e.event_type === 'impression');
    const clicks = events.filter(e => e.event_type === 'click');

    // Calculate unique sessions
    const sessionIds = new Set(events.map(e => e.session_id).filter(Boolean));
    const uniqueSessions = sessionIds.size;

    // Group by domain
    const domainStats = new Map<string, { impressions: number; clicks: number }>();
    for (const event of events) {
      const domain = event.referrer_domain;
      const stats = domainStats.get(domain) || { impressions: 0, clicks: 0 };
      if (event.event_type === 'impression') stats.impressions++;
      if (event.event_type === 'click') stats.clicks++;
      domainStats.set(domain, stats);
    }

    const topDomains = Array.from(domainStats.entries())
      .map(([domain, stats]) => ({ domain, ...stats }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10);

    // Group by day
    const dailyMap = new Map<string, { impressions: number; clicks: number }>();
    for (const event of events) {
      const date = event.timestamp.split('T')[0];
      const stats = dailyMap.get(date) || { impressions: 0, clicks: 0 };
      if (event.event_type === 'impression') stats.impressions++;
      if (event.event_type === 'click') stats.clicks++;
      dailyMap.set(date, stats);
    }

    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Device breakdown
    const deviceStats = new Map<string, number>();
    for (const event of impressions) {
      const device = event.device_type || 'unknown';
      deviceStats.set(device, (deviceStats.get(device) || 0) + 1);
    }
    const deviceBreakdown = Array.from(deviceStats.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    // Browser breakdown
    const browserStats = new Map<string, number>();
    for (const event of impressions) {
      const browser = event.browser || 'unknown';
      browserStats.set(browser, (browserStats.get(browser) || 0) + 1);
    }
    const browserBreakdown = Array.from(browserStats.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    // Country breakdown
    const countryStats = new Map<string, number>();
    for (const event of impressions) {
      const country = event.country || 'unknown';
      countryStats.set(country, (countryStats.get(country) || 0) + 1);
    }
    const countryBreakdown = Array.from(countryStats.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    // Top pages
    const pageStats = new Map<string, { impressions: number; clicks: number; title?: string }>();
    for (const event of events) {
      const path = event.page_path || '/';
      const stats = pageStats.get(path) || { impressions: 0, clicks: 0 };
      if (event.event_type === 'impression') {
        stats.impressions++;
        if (event.page_title) stats.title = event.page_title;
      }
      if (event.event_type === 'click') stats.clicks++;
      pageStats.set(path, stats);
    }
    const topPages = Array.from(pageStats.entries())
      .map(([path, stats]) => ({ path, ...stats }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10);

    return NextResponse.json({
      totalImpressions: impressions.length,
      totalClicks: clicks.length,
      clickThroughRate: impressions.length > 0 ? (clicks.length / impressions.length) * 100 : 0,
      uniqueSessions,
      topDomains,
      topPages,
      recentEvents: events.slice(0, 20),
      dailyStats,
      deviceBreakdown,
      browserBreakdown,
      countryBreakdown,
    });

  } catch (error) {
    console.error('[Embed Analytics] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      totalImpressions: 0,
      totalClicks: 0,
      clickThroughRate: 0,
      uniqueSessions: 0,
      topDomains: [],
      topPages: [],
      recentEvents: [],
      dailyStats: [],
      deviceBreakdown: [],
      browserBreakdown: [],
      countryBreakdown: [],
    }, { status: 500 });
  }
}
