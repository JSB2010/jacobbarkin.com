/**
 * Embed Analytics - Appwrite integration for tracking credit embed usage
 */
import { Client, Databases, ID, Query } from 'appwrite';

// Collection ID for embed analytics
const EMBED_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_EMBED_COLLECTION_ID || 'embed-analytics';

// Get database config from existing setup
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'contact-form-db';

// Initialize client for embed analytics
const embedClient = new Client();
embedClient.setEndpoint(endpoint).setProject(projectId);

const embedDatabases = new Databases(embedClient);

export interface EmbedEvent {
  event_type: 'impression' | 'click';
  referrer_url: string;
  referrer_domain: string;
  timestamp: string;
  user_agent?: string;
  variant?: string;
  size?: string;
  country?: string;
}

export interface AnalyticsSummary {
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  topDomains: { domain: string; impressions: number; clicks: number }[];
  recentEvents: EmbedEvent[];
  dailyStats: { date: string; impressions: number; clicks: number }[];
}

/**
 * Record an embed analytics event
 */
export async function recordEvent(event: EmbedEvent): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const doc = await embedDatabases.createDocument(
      databaseId,
      EMBED_COLLECTION_ID,
      ID.unique(),
      event
    );
    return { success: true, id: doc.$id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Embed Analytics] Failed to record event:', message);
    return { success: false, error: message };
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'unknown';
  }
}

/**
 * Get analytics summary (for dashboard)
 */
export async function getAnalyticsSummary(days: number = 30): Promise<AnalyticsSummary> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTimestamp = startDate.toISOString();

  try {
    // Fetch all events in the time range
    const response = await embedDatabases.listDocuments(
      databaseId,
      EMBED_COLLECTION_ID,
      [
        Query.greaterThan('timestamp', startTimestamp),
        Query.orderDesc('timestamp'),
        Query.limit(5000), // Adjust based on expected volume
      ]
    );

    const events = response.documents as unknown as (EmbedEvent & { $id: string })[];

    // Calculate totals
    const impressions = events.filter(e => e.event_type === 'impression');
    const clicks = events.filter(e => e.event_type === 'click');

    // Group by domain
    const domainStats = new Map<string, { impressions: number; clicks: number }>();
    for (const event of events) {
      const domain = event.referrer_domain;
      const stats = domainStats.get(domain) || { impressions: 0, clicks: 0 };
      if (event.event_type === 'impression') stats.impressions++;
      if (event.event_type === 'click') stats.clicks++;
      domainStats.set(domain, stats);
    }

    // Sort domains by impressions
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

    return {
      totalImpressions: impressions.length,
      totalClicks: clicks.length,
      clickThroughRate: impressions.length > 0 ? (clicks.length / impressions.length) * 100 : 0,
      topDomains,
      recentEvents: events.slice(0, 20),
      dailyStats,
    };
  } catch (error) {
    console.error('[Embed Analytics] Failed to get summary:', error);
    return {
      totalImpressions: 0,
      totalClicks: 0,
      clickThroughRate: 0,
      topDomains: [],
      recentEvents: [],
      dailyStats: [],
    };
  }
}

export { EMBED_COLLECTION_ID, databaseId as embedDatabaseId };

