'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Eye, MousePointer, Globe } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

// Type for embed analytics entry
interface EmbedAnalytics {
  id: string;
  page_url: string;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  event_type: string;
  created_at: string;
}

// Type for aggregated stats
interface EmbedStats {
  total_views: number;
  unique_pages: number;
  unique_visitors: number;
}

export default function EmbedAnalyticsPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<EmbedAnalytics[]>([]);
  const [stats, setStats] = useState<EmbedStats>({ total_views: 0, unique_pages: 0, unique_visitors: 0 });
  const [totalRecords, setTotalRecords] = useState(0);

  // Pagination state
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);

  // Filter state
  const [days, setDays] = useState('30');

  // Fetch analytics from API
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

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
      setStats(result.stats || { total_views: 0, unique_pages: 0, unique_visitors: 0 });
      setTotalRecords(result.total || 0);
    } catch (err: unknown) {
      setError('An error occurred while fetching analytics');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, days, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchAnalytics();
    }
  }, [isSignedIn, fetchAnalytics]);

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

  const extractDomain = (url: string | null) => {
    if (!url) return '-';
    try {
      return new URL(url).hostname;
    } catch {
      return url.substring(0, 50);
    }
  };

  return (
    <div className="container py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Eye className="h-6 w-6 text-blue-500" />
              {stats.total_views.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Pages</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Globe className="h-6 w-6 text-green-500" />
              {stats.unique_pages.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Visitors</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <MousePointer className="h-6 w-6 text-purple-500" />
              {stats.unique_visitors.toLocaleString()}
            </CardTitle>
          </CardHeader>
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
              <Select value={days} onValueChange={setDays}>
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
                  <TableHead>Page URL</TableHead>
                  <TableHead className="w-[150px]">Referrer</TableHead>
                  <TableHead className="w-[100px]">Event</TableHead>
                  <TableHead className="w-[120px]">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <span className="mt-2 text-sm text-muted-foreground">Loading analytics...</span>
                    </TableCell>
                  </TableRow>
                ) : analytics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
                        <div className="font-medium truncate max-w-[300px]" title={entry.page_url}>
                          {extractDomain(entry.page_url)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[300px]" title={entry.page_url}>
                          {entry.page_url}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-[150px]" title={entry.referrer || ''}>
                        {extractDomain(entry.referrer)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          entry.event_type === 'click'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {entry.event_type === 'click' ? <MousePointer className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                          {entry.event_type}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.ip_address || '-'}
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

