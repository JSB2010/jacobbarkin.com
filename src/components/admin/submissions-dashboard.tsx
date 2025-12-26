"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  RefreshCw,
  Calendar,
  MessageSquare,
  AlertCircle,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  User,
  Mail
} from "lucide-react";
import {
  fetchSubmissions as apiFetchSubmissions,
  deleteSubmission as apiDeleteSubmission,
} from "@/lib/api/submissions";
import type { ContactSubmission } from "@/lib/db/submissions";
import { useToast } from "@/components/ui/use-toast";
import { useFormPersistence } from "@/hooks/use-form-persistence";
import { SubmissionRow } from "./submission-row";
import { StatsCard } from "./stats-card";
import { Pagination } from "./pagination";
import { PageSizeSelector } from "./page-size-selector";
import { SearchForm } from "./search-form";

export function SubmissionsDashboard() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<ContactSubmission[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initial form values for search and pagination
  const initialValues = {
    searchQuery: "",
    currentPage: 1,
    sortField: "created_at",
    sortDirection: "desc" as "asc" | "desc",
    pageSize: 10
  };

  // Use form persistence hook for search and pagination settings
  const {
    formData,
    updateFormData,
    resetFormData,
    lastSaved,
    getTimeRemaining
  } = useFormPersistence(
    'admin-search-form',
    initialValues,
    {
      expiryMinutes: 60 * 24, // Keep search settings for 24 hours
      saveOnUnload: true,
      confirmOnUnload: false,
      onRestore: () => {
        toast({
          title: 'Search Settings Restored',
          description: 'Your previous search settings have been restored.',
          variant: 'default',
        });
      }
    }
  );

  // Destructure form values for easier access
  const { searchQuery, currentPage, sortField, sortDirection, pageSize } = formData;

  // Use pageSize state instead of fixed limit

  // Fetch all submissions for statistics with useCallback
  const fetchAllSubmissionsForStats = useCallback(async () => {
    setStatsLoading(true);

    try {
      // Fetch all submissions with a large limit
      const response = await apiFetchSubmissions({
        limit: 1000,
        offset: 0,
        orderBy: 'created_at',
        order: 'DESC'
      });

      setAllSubmissions(response.submissions as ContactSubmission[]);
    } catch (err: unknown) {
      console.error("Error fetching statistics:", err);
      // Don't show error for stats loading
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch submissions from D1 API with useCallback
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * pageSize;

      // Map sortField to D1 format
      const orderByMap: Record<string, string> = {
        'created_at': 'created_at',
        'name': 'name',
        'subject': 'subject',
        'email': 'email',
      };
      const orderBy = orderByMap[sortField] || 'created_at';

      const response = await apiFetchSubmissions({
        limit: pageSize,
        offset,
        search: searchQuery || undefined,
        orderBy,
        order: sortDirection.toUpperCase() as 'ASC' | 'DESC'
      });

      setSubmissions(response.submissions as ContactSubmission[]);
      setTotalSubmissions(response.total);
    } catch (err: unknown) {
      console.error("Error fetching submissions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortField, sortDirection, searchQuery]);

  // Fetch submissions and statistics on mount
  useEffect(() => {
    fetchSubmissions();
    fetchAllSubmissionsForStats();
  }, [fetchSubmissions, fetchAllSubmissionsForStats]);

  // Handle sorting with useCallback
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      updateFormData({
        sortDirection: newDirection,
        currentPage: 1 // Reset to first page when sorting changes
      });
    } else {
      // Set new field and default to descending
      updateFormData({
        sortField: field,
        sortDirection: "desc",
        currentPage: 1 // Reset to first page when sorting changes
      });
    }
  }, [sortField, sortDirection, updateFormData]);

  // Handle search with useCallback
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    updateFormData({ currentPage: 1 }); // Reset to first page when searching
    fetchSubmissions();

    // Save search settings
    toast({
      title: "Search settings saved",
      description: "Your search settings will be remembered for 24 hours.",
      variant: "default",
    });
  }, [updateFormData, fetchSubmissions, toast]);

  // Handle search input change with useCallback
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ searchQuery: e.target.value });
  }, [updateFormData]);

  // Handle page size change with useCallback
  const handlePageSizeChange = useCallback((value: string) => {
    const newSize = parseInt(value, 10);
    updateFormData({
      pageSize: newSize,
      currentPage: 1 // Reset to first page when changing page size
    });

    // Show toast notification
    toast({
      title: "Page size updated",
      description: `Now showing ${newSize} submissions per page.`,
      variant: "default",
    });
  }, [updateFormData, toast]);

  // Reset search form with useCallback
  const handleResetSearch = useCallback(() => {
    resetFormData();
    fetchSubmissions();

    toast({
      title: "Search reset",
      description: "Search settings have been reset to defaults.",
      variant: "default",
    });
  }, [resetFormData, fetchSubmissions, toast]);

  // Handle view submission with useCallback
  const handleViewSubmission = useCallback((submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);
  }, []);

  // Removed handleMarkAsRead function

  // Handle delete submission with useCallback
  const handleDeleteSubmission = useCallback(async (submission: ContactSubmission) => {
    if (!confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      await apiDeleteSubmission(submission.id);

      // Close dialog if the deleted submission is currently selected
      if (selectedSubmission && selectedSubmission.id === submission.id) {
        setIsDialogOpen(false);
        setSelectedSubmission(null);
      }

      // Show success toast
      toast({
        title: "Submission deleted",
        description: "The submission has been successfully deleted.",
        variant: "success",
      });

      // Refresh submissions
      fetchSubmissions();
      // Also refresh statistics
      fetchAllSubmissionsForStats();
    } catch (err: unknown) {
      console.error("Error deleting submission:", err);
      setError(err instanceof Error ? err.message : "Failed to delete submission");

      // Show error toast
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete submission",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [toast, selectedSubmission, fetchSubmissions, fetchAllSubmissionsForStats]);

  // Calculate total pages
  const totalPages = Math.ceil(totalSubmissions / pageSize);

  // Format date for display with useCallback
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  }, []);

  // Export submissions to CSV with useCallback
  const handleExportCSV = useCallback(() => {
    try {
      // Create CSV content
      const headers = ["Name", "Email", "Subject", "Message", "Date", "Source", "IP Address"];
      const csvRows = [headers];

      // Add data rows
      submissions.forEach(submission => {
        const row = [
          submission.name,
          submission.email,
          submission.subject,
          submission.message.replace(/"/g, '""'), // Escape quotes
          new Date(submission.created_at).toISOString(),
          submission.source || "",
          submission.ip_address || ""
        ];
        csvRows.push(row.map(cell => `"${cell}"`)); // Wrap in quotes to handle commas
      });

      // Create CSV content
      const csvContent = csvRows.map(row => row.join(",")).join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `contact-submissions-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success toast
      toast({
        title: "Export successful",
        description: `${submissions.length} submissions exported to CSV.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error exporting to CSV:", err);

      // Show error toast
      toast({
        title: "Export failed",
        description: "There was an error exporting submissions to CSV.",
        variant: "destructive",
      });
    }
  }, [submissions, toast]);

  // Calculate statistics using all submissions with useMemo
  const { todaySubmissions, thisWeekSubmissions, thisMonthSubmissions } = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayCount = allSubmissions.filter(s => {
      const submissionDate = new Date(s.created_at);
      return submissionDate >= todayStart;
    }).length;

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekCount = allSubmissions.filter(s => {
      const submissionDate = new Date(s.created_at);
      return submissionDate >= thisWeekStart;
    }).length;

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthCount = allSubmissions.filter(s => {
      const submissionDate = new Date(s.created_at);
      return submissionDate >= thisMonthStart;
    }).length;

    return {
      todaySubmissions: todayCount,
      thisWeekSubmissions: thisWeekCount,
      thisMonthSubmissions: thisMonthCount
    };
  }, [allSubmissions]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="relative">
        <div className="absolute right-0 top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAllSubmissionsForStats}
            disabled={statsLoading}
            className="h-8 w-8"
            title="Refresh statistics"
          >
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh statistics</span>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Submissions"
            value={allSubmissions.length}
            description="All time submissions"
            icon={<MessageSquare className="h-4 w-4" />}
            loading={statsLoading}
          />
          <StatsCard
            title="Today"
            value={todaySubmissions}
            description="Submissions today"
            icon={<Calendar className="h-4 w-4" />}
            loading={statsLoading}
          />
          <StatsCard
            title="This Week"
            value={thisWeekSubmissions}
            description="Submissions this week"
            icon={<Calendar className="h-4 w-4" />}
            loading={statsLoading}
          />
          <StatsCard
            title="This Month"
            value={thisMonthSubmissions}
            description="Submissions this month"
            icon={<Calendar className="h-4 w-4" />}
            loading={statsLoading}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Contact Form Submissions</CardTitle>
              <CardDescription>
                Manage and view submissions from your contact form
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={loading || submissions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSubmissions}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and filter */}
          <SearchForm
            searchQuery={searchQuery}
            onSearchChange={handleSearchInputChange}
            onSearch={handleSearch}
            onReset={handleResetSearch}
            loading={loading}
            lastSaved={lastSaved}
            getTimeRemaining={getTimeRemaining}
          />

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Submissions table */}
          {loading ? (
            <div className="py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No submissions found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        {sortField === "name" && (
                          sortDirection === "asc" ?
                            <ArrowUp className="h-4 w-4" /> :
                            <ArrowDown className="h-4 w-4" />
                        )}
                        {sortField !== "name" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("subject")}
                    >
                      <div className="flex items-center gap-1">
                        Subject
                        {sortField === "subject" && (
                          sortDirection === "asc" ?
                            <ArrowUp className="h-4 w-4" /> :
                            <ArrowDown className="h-4 w-4" />
                        )}
                        {sortField !== "subject" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hidden md:table-cell cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortField === "created_at" && (
                          sortDirection === "asc" ?
                            <ArrowUp className="h-4 w-4" /> :
                            <ArrowDown className="h-4 w-4" />
                        )}
                        {sortField !== "created_at" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <SubmissionRow
                      key={submission.id}
                      submission={submission}
                      onView={handleViewSubmission}
                      onDelete={handleDeleteSubmission}
                      isDeleting={isDeleting}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Page size selector and pagination */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <PageSizeSelector
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              loading={loading}
              onPageChange={(page) => updateFormData({ currentPage: page })}
            />
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Showing {submissions.length} of {totalSubmissions} submissions
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
        </CardFooter>
      </Card>

      {/* Submission details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSubmission.subject}</DialogTitle>
                <DialogDescription>
                  Submission from {selectedSubmission.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    Name:
                  </div>
                  <div className="font-medium">{selectedSubmission.name}</div>

                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    Email:
                  </div>
                  <div>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date:
                  </div>
                  <div>{formatDate(selectedSubmission.created_at)}</div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Message:</h4>
                  <div className="p-3 rounded-md bg-muted/50 whitespace-pre-wrap text-sm">
                    {selectedSubmission.message}
                  </div>
                </div>

                {(selectedSubmission.user_agent || selectedSubmission.source || selectedSubmission.ip_address) && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2">Additional Information:</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {selectedSubmission.source && (
                        <p>Source: {selectedSubmission.source}</p>
                      )}
                      {selectedSubmission.ip_address && (
                        <p>IP Address: {selectedSubmission.ip_address}</p>
                      )}
                      {selectedSubmission.user_agent && (
                        <p>User Agent: {selectedSubmission.user_agent}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex sm:justify-between gap-2">
                <div className="hidden sm:flex">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSubmission(selectedSubmission)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Mark as read button removed */}

                  <Button
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
