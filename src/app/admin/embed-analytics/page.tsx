"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/admin/protected-route";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import {
  BarChart3,
  MousePointer2,
  Eye,
  Globe,
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  FileText
} from "lucide-react";

interface DomainStats {
  domain: string;
  impressions: number;
  clicks: number;
}

interface PageStats {
  path: string;
  impressions: number;
  clicks: number;
  title?: string;
}

interface DailyStats {
  date: string;
  impressions: number;
  clicks: number;
}

interface DeviceStats {
  device: string;
  count: number;
}

interface BrowserStats {
  browser: string;
  count: number;
}

interface CountryStats {
  country: string;
  count: number;
}

interface EmbedEvent {
  event_type: 'impression' | 'click';
  referrer_url: string;
  referrer_domain: string;
  timestamp: string;
  page_path?: string;
  page_title?: string;
  variant?: string;
  size?: string;
  device_type?: string;
  browser?: string;
  country?: string;
}

interface AnalyticsSummary {
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  uniqueSessions: number;
  topDomains: DomainStats[];
  topPages: PageStats[];
  recentEvents: EmbedEvent[];
  dailyStats: DailyStats[];
  deviceBreakdown: DeviceStats[];
  browserBreakdown: BrowserStats[];
  countryBreakdown: CountryStats[];
}

function EmbedAnalyticsContent() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/embed/analytics?days=${days}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };

  return (
    <>
      <PageHero
        title="Embed Analytics"
        description="Track impressions and clicks from your credit embed across the web"
        backgroundImage="/images/code-bg.jpg"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="w-5 h-5" />
            <span>Last {days} days</span>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 rounded-md border bg-background text-sm"
              aria-label="Select time range"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-6 mb-8 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {loading && !data && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {data ? (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-3 text-muted-foreground mb-2">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm font-medium">Impressions</span>
                </div>
                <p className="text-3xl font-bold">{data.totalImpressions.toLocaleString()}</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 text-muted-foreground mb-2">
                  <MousePointer2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Clicks</span>
                </div>
                <p className="text-3xl font-bold">{data.totalClicks.toLocaleString()}</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 text-muted-foreground mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">CTR</span>
                </div>
                <p className="text-3xl font-bold">{data.clickThroughRate.toFixed(2)}%</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 text-muted-foreground mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Unique Sessions</span>
                </div>
                <p className="text-3xl font-bold">{(data.uniqueSessions || 0).toLocaleString()}</p>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Top Domains */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Top Domains
                </h2>
                {data.topDomains.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {data.topDomains.map((domain, i) => (
                      <div key={domain.domain} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                          <span className="text-sm font-medium truncate max-w-48">
                            {domain.domain}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {domain.impressions} <Eye className="w-3 h-3 inline" />
                          </span>
                          <span className="text-primary">
                            {domain.clicks} <MousePointer2 className="w-3 h-3 inline" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Daily Chart */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Daily Activity
                </h2>
                {data.dailyStats.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {data.dailyStats.slice(-7).map((day) => (
                      <div key={day.date} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-16">
                          {formatDate(day.date)}
                        </span>
                        <div className="flex-1 flex gap-1 h-5">
                          <div
                            className="bg-primary/20 rounded-sm"
                            style={{ width: `${Math.min(100, (day.impressions / Math.max(...data.dailyStats.map(d => d.impressions), 1)) * 100)}%` }}
                            title={`${day.impressions} impressions`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {day.impressions}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Device, Browser, Country Breakdown */}
            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              {/* Devices */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  Devices
                </h2>
                {(data.deviceBreakdown?.length || 0) === 0 ? (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {data.deviceBreakdown?.map((d) => (
                      <div key={d.device} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          {d.device === 'mobile' && <Smartphone className="w-4 h-4" />}
                          {d.device === 'tablet' && <Tablet className="w-4 h-4" />}
                          {d.device === 'desktop' && <Monitor className="w-4 h-4" />}
                          {d.device}
                        </span>
                        <span className="text-muted-foreground text-sm">{d.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Browsers */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Browsers
                </h2>
                {(data.browserBreakdown?.length || 0) === 0 ? (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {data.browserBreakdown?.map((b) => (
                      <div key={b.browser} className="flex items-center justify-between">
                        <span className="text-sm">{b.browser}</span>
                        <span className="text-muted-foreground text-sm">{b.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Countries */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Countries
                </h2>
                {(data.countryBreakdown?.length || 0) === 0 ? (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {data.countryBreakdown?.map((c) => (
                      <div key={c.country} className="flex items-center justify-between">
                        <span className="text-sm">{c.country || 'Unknown'}</span>
                        <span className="text-muted-foreground text-sm">{c.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Top Pages */}
            {(data.topPages?.length || 0) > 0 && (
              <Card className="p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Top Pages
                </h2>
                <div className="space-y-3">
                  {data.topPages?.slice(0, 10).map((page, i) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                        <div className="truncate">
                          <span className="text-sm font-medium">{page.path}</span>
                          {page.title && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {page.title}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm shrink-0">
                        <span className="text-muted-foreground">
                          {page.impressions} <Eye className="w-3 h-3 inline" />
                        </span>
                        <span className="text-primary">
                          {page.clicks} <MousePointer2 className="w-3 h-3 inline" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Events */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Events</h2>
              {data.recentEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No events yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium">Time</th>
                        <th className="text-left py-2 px-2 font-medium">Event</th>
                        <th className="text-left py-2 px-2 font-medium">Domain</th>
                        <th className="text-left py-2 px-2 font-medium hidden sm:table-cell">Page</th>
                        <th className="text-left py-2 px-2 font-medium hidden md:table-cell">Device</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentEvents.slice(0, 15).map((event, i) => (
                        <tr key={i} className="border-b border-muted">
                          <td className="py-2 px-2 text-muted-foreground">
                            {formatTime(event.timestamp)}
                          </td>
                          <td className="py-2 px-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                              event.event_type === 'click'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {event.event_type === 'click' ? <MousePointer2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              {event.event_type}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-mono text-xs truncate max-w-32">
                            {event.referrer_domain}
                          </td>
                          <td className="py-2 px-2 font-mono text-xs truncate max-w-32 hidden sm:table-cell">
                            {event.page_path || '/'}
                          </td>
                          <td className="py-2 px-2 text-muted-foreground hidden md:table-cell">
                            {event.device_type || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        ) : null}
      </div>
    </>
  );
}

export default function EmbedAnalyticsPage() {
  return (
    <ProtectedRoute>
      <EmbedAnalyticsContent />
    </ProtectedRoute>
  );
}

