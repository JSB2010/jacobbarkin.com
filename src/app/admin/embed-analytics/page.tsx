'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Eye, MousePointer, Globe, Users, Percent } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

// Type for embed analytics entry
interface EmbedAnalytics {
  id: string;
  page_url: string;
  page_host: string | null;
  page_path: string | null;
  page_title: string | null;
  referrer: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  user_agent: string | null;
  ip_address: string | null;
  event_type: string;
  embed_version: string | null;
  embed_variant: string | null;
  embed_size: string | null;
  embed_theme: string | null;
  embed_position: string | null;
  embed_align: string | null;
  embed_instance_id: string | null;
  is_auto: number | null;
  language: string | null;
  timezone_offset: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  device_type: string | null;
  connection_type: string | null;
  created_at: string;
}

// Type for aggregated stats
interface EmbedStats {
  impressions: number;
  clicks: number;
  ctr: number;
  unique_pages: number;
  unique_domains: number;
  unique_visitors: number;
  auto_impressions: number;
  auto_clicks: number;
}

interface TopPage {
  page_url: string;
  impressions: number;
  clicks: number;
}

interface TopReferrer {
  referrer: string;
  impressions: number;
  clicks: number;
}

interface TopDomain {
  page_host: string;
  impressions: number;
  clicks: number;
}

interface TopVariant {
  embed_variant: string;
  impressions: number;
  clicks: number;
}

interface TopDevice {
  device_type: string;
  impressions: number;
  clicks: number;
}

interface TopCampaign {
  utm_campaign: string;
  impressions: number;
  clicks: number;
}

interface TopVersion {
  embed_version: string;
  impressions: number;
  clicks: number;
}

interface HeartbeatSite {
  page_host: string;
  first_seen: string;
  last_seen: string;
  last_page_url: string | null;
  last_page_title: string | null;
  last_referrer: string | null;
  last_embed_version: string | null;
  last_embed_variant: string | null;
  last_embed_size: string | null;
  last_embed_theme: string | null;
  last_embed_position: string | null;
  last_embed_align: string | null;
  last_is_auto: number | null;
  last_language: string | null;
  last_timezone_offset: number | null;
  last_viewport_width: number | null;
  last_viewport_height: number | null;
  last_device_type: string | null;
  last_connection_type: string | null;
  heartbeat_count: number;
}

interface HeartbeatStats {
  total_sites: number;
  new_sites: number;
  active_24h: number;
  active_7d: number;
  active_30d: number;
  active_90d: number;
}

interface BreakdownRow {
  key: string;
  label: string;
  sublabel?: string;
  impressions: number;
  clicks: number;
}

function BreakdownTable({
  rows,
  isLoading,
  emptyLabel,
}: {
  rows: BreakdownRow[];
  isLoading: boolean;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Label</TableHead>
            <TableHead className="text-right">Impressions</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">CTR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-16 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-16 text-center text-sm text-muted-foreground">
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell>
                  <div className="font-medium truncate max-w-[220px]" title={row.label}>
                    {row.label}
                  </div>
                  {row.sublabel ? (
                    <div className="text-xs text-muted-foreground truncate max-w-[220px]" title={row.sublabel}>
                      {row.sublabel}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="text-right">{row.impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right">{row.impressions ? `${((row.clicks / row.impressions) * 100).toFixed(1)}%` : '0.0%'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function EmbedAnalyticsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<EmbedAnalytics[]>([]);
  const [stats, setStats] = useState<EmbedStats>({
    impressions: 0,
    clicks: 0,
    ctr: 0,
    unique_pages: 0,
    unique_domains: 0,
    unique_visitors: 0,
    auto_impressions: 0,
    auto_clicks: 0,
  });
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [topDomains, setTopDomains] = useState<TopDomain[]>([]);
  const [topVariants, setTopVariants] = useState<TopVariant[]>([]);
  const [topDevices, setTopDevices] = useState<TopDevice[]>([]);
  const [topCampaigns, setTopCampaigns] = useState<TopCampaign[]>([]);
  const [topVersions, setTopVersions] = useState<TopVersion[]>([]);
  const [heartbeatSites, setHeartbeatSites] = useState<HeartbeatSite[]>([]);
  const [heartbeatStats, setHeartbeatStats] = useState<HeartbeatStats>({
    total_sites: 0,
    new_sites: 0,
    active_24h: 0,
    active_7d: 0,
    active_30d: 0,
    active_90d: 0,
  });
  const [heartbeatTotal, setHeartbeatTotal] = useState(0);
  const [heartbeatError, setHeartbeatError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // Pagination state
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);

  // Filter state
  const [days, setDays] = useState('30');
  const [heartbeatStatusFilter, setHeartbeatStatusFilter] = useState('all');
  const [heartbeatSearch, setHeartbeatSearch] = useState('');
  const heartbeatLimit = 25;

  // Fetch analytics from API
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHeartbeatError(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', offset.toString());
      params.set('days', days);

      const response = await fetch(`/api/embed-analytics?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/sign-in');
          return;
        }
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setAnalytics(result.analytics || []);
      setStats(result.stats || {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        unique_pages: 0,
        unique_domains: 0,
        unique_visitors: 0,
        auto_impressions: 0,
        auto_clicks: 0,
      });
      setTopPages(result.top_pages || []);
      setTopReferrers(result.top_referrers || []);
      setTopDomains(result.top_domains || []);
      setTopVariants(result.top_variants || []);
      setTopDevices(result.top_devices || []);
      setTopCampaigns(result.top_campaigns || []);
      setTopVersions(result.top_versions || []);
      setTotalRecords(result.total || 0);

      const heartbeatParams = new URLSearchParams();
      heartbeatParams.set('limit', heartbeatLimit.toString());
      heartbeatParams.set('offset', '0');
      heartbeatParams.set('days', days);

      const heartbeatResponse = await fetch(`/api/embed-heartbeat?${heartbeatParams.toString()}`);
      if (!heartbeatResponse.ok) {
        if (heartbeatResponse.status === 401) {
          router.push('/sign-in');
          return;
        }
        setHeartbeatError('An error occurred while fetching heartbeat data');
      } else {
        const heartbeatResult = await heartbeatResponse.json();
        setHeartbeatSites(heartbeatResult.sites || []);
        setHeartbeatStats(heartbeatResult.stats || {
          total_sites: 0,
          new_sites: 0,
          active_24h: 0,
          active_7d: 0,
          active_30d: 0,
          active_90d: 0,
        });
        setHeartbeatTotal(heartbeatResult.total || 0);
      }
    } catch (err: unknown) {
      setError('An error occurred while fetching analytics');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, days, heartbeatLimit, router]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setIsLoading(false);
      router.push('/sign-in');
      return;
    }
    fetchAnalytics();
  }, [isLoaded, isSignedIn, fetchAnalytics, router]);

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(totalRecords / limit);
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setOffset((newPage - 1) * limit);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const extractDomain = (url: string | null, fallbackHost?: string | null) => {
    if (fallbackHost) return fallbackHost;
    if (!url) return '-';
    if (url === '(direct)') return 'Direct / None';
    try {
      return new URL(url).hostname;
    } catch {
      return url.substring(0, 50);
    }
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const normalizeEventType = (eventType: string) => (eventType === 'view' ? 'impression' : eventType);

  const handleDaysChange = (value: string) => {
    setDays(value);
    setPage(1);
    setOffset(0);
  };

  const getCtr = (impressions: number, clicks: number) => {
    if (!impressions) return '0.0%';
    return formatPercent(clicks / impressions);
  };

  const formatTimezoneOffset = (offset: number | null) => {
    if (offset === null || Number.isNaN(offset)) return '-';
    const sign = offset <= 0 ? '+' : '-';
    const abs = Math.abs(offset);
    const hours = Math.floor(abs / 60).toString().padStart(2, '0');
    const minutes = Math.floor(abs % 60).toString().padStart(2, '0');
    return `UTC${sign}${hours}:${minutes}`;
  };

  const formatUtm = (entry: EmbedAnalytics) => {
    const parts = [
      entry.utm_source && `src:${entry.utm_source}`,
      entry.utm_medium && `med:${entry.utm_medium}`,
      entry.utm_campaign && `camp:${entry.utm_campaign}`,
    ].filter(Boolean);
    return parts.length ? parts.join(' • ') : null;
  };

  const formatEmbedMeta = (entry: EmbedAnalytics) => {
    const parts = [
      entry.embed_variant,
      entry.embed_size,
      entry.embed_position,
      entry.embed_theme,
      entry.embed_align,
    ].filter(Boolean);
    return parts.length ? parts.join(' • ') : 'default';
  };

  const formatViewport = (entry: EmbedAnalytics) => {
    if (entry.viewport_width && entry.viewport_height) {
      return `${entry.viewport_width}×${entry.viewport_height}`;
    }
    return '-';
  };

  const formatHeartbeatViewport = (entry: HeartbeatSite) => {
    if (entry.last_viewport_width && entry.last_viewport_height) {
      return `${entry.last_viewport_width}×${entry.last_viewport_height}`;
    }
    return '-';
  };

  const formatRelativeTime = (dateString: string) => {
    const time = new Date(dateString).getTime();
    if (Number.isNaN(time)) return '-';
    const diffMs = Date.now() - time;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const daysAgo = Math.floor(hours / 24);
    if (daysAgo < 7) return `${daysAgo}d ago`;
    return formatDate(dateString);
  };

  const getHeartbeatStatus = (lastSeen: string) => {
    const time = new Date(lastSeen).getTime();
    if (Number.isNaN(time)) {
      return { id: 'unknown', label: 'Unknown', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' };
    }
    const diffHours = (Date.now() - time) / (1000 * 60 * 60);
    if (diffHours <= 24) {
      return { id: 'active', label: 'Active', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
    }
    if (diffHours <= 24 * 30) {
      return { id: 'stale', label: 'Stale', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' };
    }
    if (diffHours <= 24 * 90) {
      return { id: 'dormant', label: 'Dormant', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' };
    }
    return { id: 'offline', label: 'Offline', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' };
  };

  const formatHeartbeatMeta = (entry: HeartbeatSite) => {
    const parts = [
      entry.last_embed_variant,
      entry.last_embed_size,
      entry.last_embed_position,
      entry.last_embed_theme,
      entry.last_embed_align,
    ].filter(Boolean);
    return parts.length ? parts.join(' • ') : 'default';
  };

  const manualImpressions = Math.max(stats.impressions - stats.auto_impressions, 0);
  const manualClicks = Math.max(stats.clicks - stats.auto_clicks, 0);
  const autoShare = stats.impressions ? stats.auto_impressions / stats.impressions : 0;
  const manualShare = stats.impressions ? manualImpressions / stats.impressions : 0;
  const heartbeatStale = Math.max(heartbeatStats.total_sites - heartbeatStats.active_24h, 0);

  const heartbeatQuery = heartbeatSearch.trim().toLowerCase();
  const heartbeatFilteredSites = heartbeatSites.filter((site) => {
    const status = getHeartbeatStatus(site.last_seen);
    if (heartbeatStatusFilter !== 'all' && status.id !== heartbeatStatusFilter) {
      return false;
    }
    if (!heartbeatQuery) return true;
    const haystack = [
      site.page_host,
      site.last_page_url,
      site.last_page_title,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(heartbeatQuery);
  });

  const topDomainRows: BreakdownRow[] = topDomains.map((entry) => ({
    key: entry.page_host,
    label: entry.page_host === '(unknown)' ? 'Unknown domain' : entry.page_host,
    impressions: entry.impressions,
    clicks: entry.clicks,
  }));

  const topVariantRows: BreakdownRow[] = topVariants.map((entry) => ({
    key: entry.embed_variant,
    label: entry.embed_variant === '(unknown)' ? 'Unknown variant' : entry.embed_variant,
    impressions: entry.impressions,
    clicks: entry.clicks,
  }));

  const topDeviceRows: BreakdownRow[] = topDevices.map((entry) => ({
    key: entry.device_type,
    label: entry.device_type === '(unknown)' ? 'Unknown device' : entry.device_type,
    impressions: entry.impressions,
    clicks: entry.clicks,
  }));

  const topCampaignRows: BreakdownRow[] = topCampaigns.map((entry) => ({
    key: entry.utm_campaign,
    label: entry.utm_campaign === '(none)' ? 'No campaign' : entry.utm_campaign,
    impressions: entry.impressions,
    clicks: entry.clicks,
  }));

  const topVersionRows: BreakdownRow[] = topVersions.map((entry) => ({
    key: entry.embed_version,
    label: entry.embed_version === '(unknown)' ? 'Unknown version' : entry.embed_version,
    impressions: entry.impressions,
    clicks: entry.clicks,
  }));

  return (
    <div className="container py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Impressions</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Eye className="h-6 w-6 text-blue-500" />
              {stats.impressions.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Clicks</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <MousePointer className="h-6 w-6 text-green-500" />
              {stats.clicks.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CTR</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Percent className="h-6 w-6 text-purple-500" />
              {formatPercent(stats.ctr)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Visitors</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-6 w-6 text-rose-500" />
              {stats.unique_visitors.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Pages</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Globe className="h-6 w-6 text-amber-500" />
              {stats.unique_pages.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Sites</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Globe className="h-6 w-6 text-teal-500" />
              {stats.unique_domains.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Heartbeat Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sites</CardDescription>
            <CardTitle className="text-2xl">{heartbeatStats.total_sites.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active 24h</CardDescription>
            <CardTitle className="text-2xl">{heartbeatStats.active_24h.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active 7d</CardDescription>
            <CardTitle className="text-2xl">{heartbeatStats.active_7d.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New in {days}d</CardDescription>
            <CardTitle className="text-2xl">{heartbeatStats.new_sites.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stale 24h+</CardDescription>
            <CardTitle className="text-2xl">{heartbeatStale.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {heartbeatError && (
        <div className="p-3 mb-4 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-300 text-sm">
          {heartbeatError}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Heartbeat Sites</CardTitle>
              <CardDescription>
                Sites that pinged in the last {days} days
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={heartbeatSearch}
                  onChange={(event) => setHeartbeatSearch(event.target.value)}
                  placeholder="Search domains or pages"
                  className="w-full sm:w-[220px] h-9"
                />
                <Select value={heartbeatStatusFilter} onValueChange={setHeartbeatStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active (24h)</SelectItem>
                    <SelectItem value="stale">Stale (24h-30d)</SelectItem>
                    <SelectItem value="dormant">Dormant (30-90d)</SelectItem>
                    <SelectItem value="offline">Offline (90d+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {heartbeatFilteredSites.length} of {heartbeatTotal} sites
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead className="w-[160px]">Last Seen</TableHead>
                  <TableHead className="w-[160px]">First Seen</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px] text-right">Heartbeats</TableHead>
                  <TableHead className="w-[220px]">Last Embed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-20 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : heartbeatFilteredSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-20 text-center text-sm text-muted-foreground">
                      {heartbeatSites.length === 0 ? 'No heartbeat data yet' : 'No sites match your filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  heartbeatFilteredSites.map((site) => {
                    const status = getHeartbeatStatus(site.last_seen);
                    return (
                      <TableRow key={site.page_host}>
                        <TableCell>
                          <div className="font-medium truncate max-w-[220px]" title={site.page_host}>
                            {site.page_host}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[220px]" title={site.last_page_url || ''}>
                            {site.last_page_title || site.last_page_url || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-medium">{formatRelativeTime(site.last_seen)}</div>
                          <div className="text-muted-foreground">{formatDate(site.last_seen)}</div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-medium">{formatRelativeTime(site.first_seen)}</div>
                          <div className="text-muted-foreground">{formatDate(site.first_seen)}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {site.heartbeat_count.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium truncate max-w-[200px]" title={formatHeartbeatMeta(site)}>
                            {formatHeartbeatMeta(site)}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {site.last_embed_version ? `v${site.last_embed_version}` : 'version unknown'} • {site.last_is_auto === 1 ? 'auto' : site.last_is_auto === 0 ? 'manual' : 'unknown'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {(site.last_device_type || 'unknown')} • {formatHeartbeatViewport(site)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Pages / Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most active pages for your embed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-16 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : topPages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-16 text-center text-sm text-muted-foreground">
                        No page data yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    topPages.map((entry) => (
                      <TableRow key={entry.page_url}>
                        <TableCell>
                          <div className="font-medium truncate max-w-[220px]" title={entry.page_url}>
                            {extractDomain(entry.page_url)}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[220px]" title={entry.page_url}>
                            {entry.page_url}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{entry.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{entry.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{getCtr(entry.impressions, entry.clicks)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Referrers</CardTitle>
            <CardDescription>Where visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-16 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : topReferrers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-16 text-center text-sm text-muted-foreground">
                        No referrer data yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    topReferrers.map((entry) => (
                      <TableRow key={entry.referrer}>
                        <TableCell>
                          <div className="font-medium truncate max-w-[220px]" title={entry.referrer}>
                            {extractDomain(entry.referrer)}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[220px]" title={entry.referrer}>
                            {entry.referrer === '(direct)' ? 'No referrer' : entry.referrer}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{entry.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{entry.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{getCtr(entry.impressions, entry.clicks)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Install Method + Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Install Methods</CardTitle>
            <CardDescription>Auto-inject vs manual embeds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auto</span>
                <span className="font-medium">
                  {stats.auto_impressions.toLocaleString()} impressions • {getCtr(stats.auto_impressions, stats.auto_clicks)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Manual</span>
                <span className="font-medium">
                  {manualImpressions.toLocaleString()} impressions • {getCtr(manualImpressions, manualClicks)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${Math.round(autoShare * 100)}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPercent(autoShare)} auto • {formatPercent(manualShare)} manual
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Domains</CardTitle>
            <CardDescription>Sites embedding your credit</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownTable rows={topDomainRows} isLoading={isLoading} emptyLabel="No domain data yet" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Variants</CardTitle>
            <CardDescription>Most used embed styles</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownTable rows={topVariantRows} isLoading={isLoading} emptyLabel="No variant data yet" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Devices</CardTitle>
            <CardDescription>Where visitors view the embed</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownTable rows={topDeviceRows} isLoading={isLoading} emptyLabel="No device data yet" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Campaigns</CardTitle>
            <CardDescription>UTM campaign performance</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownTable rows={topCampaignRows} isLoading={isLoading} emptyLabel="No campaign data yet" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Versions</CardTitle>
            <CardDescription>Embed script adoption</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownTable rows={topVersionRows} isLoading={isLoading} emptyLabel="No version data yet" />
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Embed Analytics</CardTitle>
              <CardDescription>
                Track where your credit embed is being used
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={days} onValueChange={handleDaysChange}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Date</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="w-[200px]">Referrer / UTM</TableHead>
                  <TableHead className="w-[100px]">Event</TableHead>
                  <TableHead className="w-[200px]">Embed</TableHead>
                  <TableHead className="w-[200px]">Visitor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <span className="mt-2 text-sm text-muted-foreground">Loading analytics...</span>
                    </TableCell>
                  </TableRow>
                ) : analytics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <span className="text-sm text-muted-foreground">No analytics data found</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  analytics.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium truncate max-w-[260px]" title={entry.page_url}>
                          {extractDomain(entry.page_url, entry.page_host)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[260px]" title={entry.page_title || entry.page_url}>
                          {entry.page_title || entry.page_path || entry.page_url}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium truncate max-w-[180px]" title={entry.referrer || ''}>
                          {extractDomain(entry.referrer, entry.referrer_host)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]" title={entry.referrer || ''}>
                          {formatUtm(entry) || (entry.referrer ? entry.referrer : 'No referrer')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          entry.event_type === 'click'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {entry.event_type === 'click' ? <MousePointer className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                          {normalizeEventType(entry.event_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium truncate max-w-[180px]" title={formatEmbedMeta(entry)}>
                          {formatEmbedMeta(entry)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {entry.embed_version ? `v${entry.embed_version}` : 'version unknown'} • {entry.is_auto === 1 ? 'auto' : entry.is_auto === 0 ? 'manual' : 'unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium truncate max-w-[180px]">
                          {(entry.device_type || 'unknown')} • {formatViewport(entry)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {entry.language || '-'} • {formatTimezoneOffset(entry.timezone_offset)}{entry.connection_type ? ` • ${entry.connection_type}` : ''}
                        </div>
                        <div className="font-mono text-xs truncate max-w-[180px]">
                          {entry.ip_address || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {offset + 1}-{Math.min(offset + limit, totalRecords)} of {totalRecords} records
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">
                Page {page} of {Math.max(1, Math.ceil(totalRecords / limit))}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= Math.ceil(totalRecords / limit) || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
