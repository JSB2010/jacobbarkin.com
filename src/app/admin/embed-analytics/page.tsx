"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BarChart3, Download, Eye, Filter, Globe, Loader2, MousePointerClick, RefreshCw, Search, ShieldAlert, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmbedLineChart } from "@/components/admin/embed-line-chart";
import { EmbedRulesManager } from "@/components/admin/embed-rules-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

type OverviewResponse = {
  overview: {
    current: {
      loads: number;
      impressions: number;
      clicks: number;
      ctr: number;
      heartbeats: number;
      errors: number;
      replacement_applied: number;
      replacement_skipped: number;
      active_installations: number;
      unique_sessions: number;
    };
    deltas: Record<string, number>;
    top_movers: { page_host: string; impressions: number; clicks: number; heartbeats: number }[];
    alerts: { installation_id: string; page_host: string; last_seen: string; last_embed_version: string | null; event_count: number }[];
  };
  filters: {
    hosts: string[];
    variants: string[];
    devices: string[];
    versions: string[];
  };
};

type TimeseriesPoint = {
  date: string;
  loads: number;
  impressions: number;
  clicks: number;
  ctr: number;
  heartbeats: number;
  errors: number;
  active_installations: number;
};

type Site = {
  installation_id: string;
  site_key: string | null;
  page_host: string;
  label: string | null;
  environment: string;
  last_seen: string;
  last_page_url: string | null;
  last_embed_version: string | null;
  last_embed_variant: string | null;
  last_is_auto: number;
  last_device_type: string | null;
  event_count: number;
  impression_count: number;
  click_count: number;
  heartbeat_count: number;
};

type VariantRow = {
  embed_variant?: string;
  embed_version?: string;
  page_host?: string;
  impressions: number;
  clicks: number;
  heartbeats?: number;
};

type EventRow = {
  id: string;
  created_at: string;
  event_name: string;
  page_host: string | null;
  page_url: string;
  page_title: string | null;
  referrer_host: string | null;
  utm_campaign: string | null;
  embed_variant: string | null;
  embed_version: string | null;
  device_type: string | null;
  installation_id: string;
  rule_id: string | null;
  template_id: string | null;
  action_type: string | null;
  load_ms: number | null;
  render_ms: number | null;
  error_code: string | null;
  session_id: string;
};

function formatDelta(value: number | undefined) {
  const delta = Number(value || 0);
  const positive = delta >= 0;
  const Icon = positive ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${positive ? "text-emerald-600" : "text-rose-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(delta * 100).toFixed(1)}%
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatRelativeTime(value: string) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return value;
  const diffMinutes = Math.round((Date.now() - time) / 60000);
  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function downloadCsv(filename: string, rows: Record<string, string | number | null | undefined>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const raw = row[header];
          const value = raw === null || raw === undefined ? "" : String(raw);
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function EmbedAnalyticsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [days, setDays] = useState("30");
  const [host, setHost] = useState("__all__");
  const [variant, setVariant] = useState("__all__");
  const [device, setDevice] = useState("__all__");
  const [version, setVersion] = useState("__all__");
  const [installMethod, setInstallMethod] = useState("__all__");
  const [query, setQuery] = useState("");
  const [overview, setOverview] = useState<OverviewResponse["overview"] | null>(null);
  const [filterOptions, setFilterOptions] = useState<OverviewResponse["filters"]>({ hosts: [], variants: [], devices: [], versions: [] });
  const [series, setSeries] = useState<TimeseriesPoint[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesTotal, setSitesTotal] = useState(0);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const [versionRows, setVersionRows] = useState<VariantRow[]>([]);
  const [bestHosts, setBestHosts] = useState<VariantRow[]>([]);
  const [worstHosts, setWorstHosts] = useState<VariantRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);

  const params = useMemo(() => {
    const searchParams = new URLSearchParams();
    searchParams.set("days", days);
    if (host !== "__all__") searchParams.set("host", host);
    if (variant !== "__all__") searchParams.set("variant", variant);
    if (device !== "__all__") searchParams.set("device", device);
    if (version !== "__all__") searchParams.set("version", version);
    if (installMethod !== "__all__") searchParams.set("installMethod", installMethod);
    if (query.trim()) searchParams.set("q", query.trim());
    searchParams.set("limit", "50");
    return searchParams.toString();
  }, [days, host, variant, device, version, installMethod, query]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewResponse, timeseriesResponse, sitesResponse, variantsResponse, eventsResponse] = await Promise.all([
        fetch(`/api/embed-report/overview?${params}`),
        fetch(`/api/embed-report/timeseries?${params}`),
        fetch(`/api/embed-report/sites?${params}`),
        fetch(`/api/embed-report/variants?${params}`),
        fetch(`/api/embed-report/events?${params}`),
      ]);

      if ([overviewResponse, timeseriesResponse, sitesResponse, variantsResponse, eventsResponse].some((response) => !response.ok)) {
        throw new Error("Failed to load one or more embed report endpoints");
      }

      const [overviewJson, timeseriesJson, sitesJson, variantsJson, eventsJson] = await Promise.all([
        overviewResponse.json(),
        timeseriesResponse.json(),
        sitesResponse.json(),
        variantsResponse.json(),
        eventsResponse.json(),
      ]);

      setOverview(overviewJson.overview || null);
      setFilterOptions(overviewJson.filters || { hosts: [], variants: [], devices: [], versions: [] });
      setSeries(timeseriesJson.series || []);
      setSites(sitesJson.sites || []);
      setSitesTotal(Number(sitesJson.total || 0));
      setVariantRows(variantsJson.variants || []);
      setVersionRows(variantsJson.versions || []);
      setBestHosts(variantsJson.best_hosts || []);
      setWorstHosts(variantsJson.worst_hosts || []);
      setEvents(eventsJson.events || []);
      setEventsTotal(Number(eventsJson.total || 0));
    } catch (error) {
      console.error(error);
      toast({
        title: "Embed reports failed",
        description: "One or more report endpoints could not be loaded.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [params, toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const chartImpressions = series.map((point) => ({ date: point.date, value: point.impressions }));
  const chartClicks = series.map((point) => ({ date: point.date, value: point.clicks }));
  const chartActiveSites = series.map((point) => ({ date: point.date, value: point.active_installations }));

  const eventCsvRows = events.map((event) => ({
    created_at: event.created_at,
    event_name: event.event_name,
    page_host: event.page_host,
    page_url: event.page_url,
    page_title: event.page_title,
    referrer_host: event.referrer_host,
    utm_campaign: event.utm_campaign,
    embed_variant: event.embed_variant,
    embed_version: event.embed_version,
    device_type: event.device_type,
    installation_id: event.installation_id,
    rule_id: event.rule_id,
    template_id: event.template_id,
    action_type: event.action_type,
    load_ms: event.load_ms,
    render_ms: event.render_ms,
    error_code: event.error_code,
    session_id: event.session_id,
  }));

  return (
    <AdminShell
      title="Embed Intelligence"
      description="Overview, site health, performance, rules, and raw event exploration for the credit embed."
      icon={BarChart3}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      }
    >
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Global Filters
              </CardTitle>
              <CardDescription>
                Apply filters once and keep overview, site health, performance, and event explorer aligned.
              </CardDescription>
            </div>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={host} onValueChange={setHost}>
                <SelectTrigger><SelectValue placeholder="Host" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All hosts</SelectItem>
                  {filterOptions.hosts.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={variant} onValueChange={setVariant}>
                <SelectTrigger><SelectValue placeholder="Variant" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All variants</SelectItem>
                  {filterOptions.variants.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={device} onValueChange={setDevice}>
                <SelectTrigger><SelectValue placeholder="Device" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All devices</SelectItem>
                  {filterOptions.devices.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={version} onValueChange={setVersion}>
                <SelectTrigger><SelectValue placeholder="Version" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All versions</SelectItem>
                  {filterOptions.versions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={installMethod} onValueChange={setInstallMethod}>
                <SelectTrigger><SelectValue placeholder="Install method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All install methods</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search sites or event pages"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading && !overview ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : null}

      {overview ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Impressions</CardDescription>
                <CardTitle className="flex items-center gap-2 text-3xl">
                  <Eye className="h-6 w-6 text-sky-500" />
                  {overview.current.impressions.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>{formatDelta(overview.deltas.impressions)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Clicks</CardDescription>
                <CardTitle className="flex items-center gap-2 text-3xl">
                  <MousePointerClick className="h-6 w-6 text-emerald-500" />
                  {overview.current.clicks.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>{formatDelta(overview.deltas.clicks)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unique Sessions</CardDescription>
                <CardTitle className="flex items-center gap-2 text-3xl">
                  <Users className="h-6 w-6 text-violet-500" />
                  {overview.current.unique_sessions.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>{formatDelta(overview.deltas.unique_sessions)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Installations</CardDescription>
                <CardTitle className="flex items-center gap-2 text-3xl">
                  <Globe className="h-6 w-6 text-amber-500" />
                  {overview.current.active_installations.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>{formatDelta(overview.deltas.heartbeats)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Error Events</CardDescription>
                <CardTitle className="flex items-center gap-2 text-3xl">
                  <ShieldAlert className="h-6 w-6 text-rose-500" />
                  {overview.current.errors.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>{formatDelta(overview.deltas.errors)}</CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sites">Sites</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-3">
                <EmbedLineChart title="Impressions" data={chartImpressions} color="#0ea5e9" />
                <EmbedLineChart title="Clicks" data={chartClicks} color="#10b981" />
                <EmbedLineChart title="Active installations" data={chartActiveSites} color="#f59e0b" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Movers</CardTitle>
                    <CardDescription>Highest-volume hosts across the current filter set.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Host</TableHead>
                            <TableHead className="text-right">Impr.</TableHead>
                            <TableHead className="text-right">Clicks</TableHead>
                            <TableHead className="text-right">Heartbeats</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overview.top_movers.map((item) => (
                            <TableRow key={item.page_host}>
                              <TableCell className="font-medium">{item.page_host || "(unknown)"}</TableCell>
                              <TableCell className="text-right">{Number(item.impressions || 0).toLocaleString()}</TableCell>
                              <TableCell className="text-right">{Number(item.clicks || 0).toLocaleString()}</TableCell>
                              <TableCell className="text-right">{Number(item.heartbeats || 0).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Operational Alerts</CardTitle>
                    <CardDescription>Oldest last-seen installations first.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {overview.alerts.map((alert) => (
                      <div key={alert.installation_id} className="rounded-xl border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">{alert.page_host || alert.installation_id}</div>
                          <Badge variant="outline">{alert.last_embed_version || "unknown version"}</Badge>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Last seen {formatRelativeTime(alert.last_seen)} · {Number(alert.event_count || 0).toLocaleString()} events
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sites">
              <Card>
                <CardHeader>
                  <CardTitle>Installations</CardTitle>
                  <CardDescription>{sitesTotal.toLocaleString()} installations matched the current filters.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Site</TableHead>
                          <TableHead>Last Seen</TableHead>
                          <TableHead>Embed</TableHead>
                          <TableHead className="text-right">Events</TableHead>
                          <TableHead className="text-right">Impr.</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sites.map((site) => (
                          <TableRow key={site.installation_id}>
                            <TableCell>
                              <div className="font-medium">{site.label || site.page_host}</div>
                              <div className="text-xs text-muted-foreground">{site.last_page_url || site.installation_id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatRelativeTime(site.last_seen)}</div>
                              <div className="text-xs text-muted-foreground">{formatDate(site.last_seen)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{site.last_embed_variant || "unknown"} · {site.last_embed_version || "unknown"}</div>
                              <div className="text-xs text-muted-foreground">{site.last_is_auto === 1 ? "auto" : "manual"} · {site.last_device_type || "unknown device"}</div>
                            </TableCell>
                            <TableCell className="text-right">{site.event_count.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{site.impression_count.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{site.click_count.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Variant Comparison</CardTitle>
                    <CardDescription>CTR and usage by credit variant.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Variant</TableHead>
                            <TableHead className="text-right">Impr.</TableHead>
                            <TableHead className="text-right">Clicks</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variantRows.map((row) => {
                            const impressions = Number(row.impressions || 0);
                            const clicks = Number(row.clicks || 0);
                            return (
                              <TableRow key={row.embed_variant}>
                                <TableCell>{row.embed_variant || "(unknown)"}</TableCell>
                                <TableCell className="text-right">{impressions.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{clicks.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{impressions > 0 ? `${((clicks / impressions) * 100).toFixed(1)}%` : "0.0%"}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Version Adoption</CardTitle>
                    <CardDescription>Current version spread within the filtered window.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Version</TableHead>
                            <TableHead className="text-right">Impr.</TableHead>
                            <TableHead className="text-right">Clicks</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {versionRows.map((row) => (
                            <TableRow key={row.embed_version}>
                              <TableCell>{row.embed_version || "(unknown)"}</TableCell>
                              <TableCell className="text-right">{Number(row.impressions || 0).toLocaleString()}</TableCell>
                              <TableCell className="text-right">{Number(row.clicks || 0).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Best CTR Hosts</CardTitle>
                    <CardDescription>Highest-converting hosts with traffic.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Host</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bestHosts.map((row) => (
                            <TableRow key={`best-${row.page_host}`}>
                              <TableCell>{row.page_host || "(unknown)"}</TableCell>
                              <TableCell className="text-right">
                                {Number(row.impressions || 0) > 0 ? `${((Number(row.clicks || 0) / Number(row.impressions || 0)) * 100).toFixed(1)}%` : "0.0%"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Worst CTR Hosts</CardTitle>
                    <CardDescription>Lowest-converting hosts with traffic.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Host</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {worstHosts.map((row) => (
                            <TableRow key={`worst-${row.page_host}`}>
                              <TableCell>{row.page_host || "(unknown)"}</TableCell>
                              <TableCell className="text-right">
                                {Number(row.impressions || 0) > 0 ? `${((Number(row.clicks || 0) / Number(row.impressions || 0)) * 100).toFixed(1)}%` : "0.0%"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rules">
              <EmbedRulesManager />
            </TabsContent>

            <TabsContent value="explorer">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle>Event Explorer</CardTitle>
                      <CardDescription>
                        {eventsTotal.toLocaleString()} matching events in the current window.
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => downloadCsv(`embed-events-${Date.now()}.csv`, eventCsvRows)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Page</TableHead>
                          <TableHead>Embed</TableHead>
                          <TableHead>Rule</TableHead>
                          <TableHead>Perf</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="text-xs font-mono">{formatDate(event.created_at)}</TableCell>
                            <TableCell>
                              <div className="font-medium capitalize">{event.event_name.replaceAll("_", " ")}</div>
                              <div className="text-xs text-muted-foreground">{event.device_type || "unknown device"} · {event.utm_campaign || "no campaign"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{event.page_host || "(unknown)"}</div>
                              <div className="max-w-[260px] truncate text-xs text-muted-foreground">{event.page_title || event.page_url}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{event.embed_variant || "unknown"} · {event.embed_version || "unknown"}</div>
                              <div className="text-xs text-muted-foreground">{event.installation_id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{event.rule_id || "—"}</div>
                              <div className="text-xs text-muted-foreground">{event.template_id || event.action_type || "—"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{event.load_ms ?? "—"} / {event.render_ms ?? "—"} ms</div>
                              <div className="text-xs text-muted-foreground">{event.error_code || event.session_id.slice(0, 16)}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </AdminShell>
  );
}
