'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Save, Mail, Trash, Clock, AlertTriangle, Tag } from 'lucide-react';
import { useAdminAuth } from '@/components/admin/auth-context';
import { ProtectedRoute } from '@/components/admin/protected-route';



// Submission type - extends ContactSubmission with optional admin fields
interface Submission {
  $id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp?: string;
  status?: 'new' | 'read' | 'replied' | 'archived';
  priority?: number;
  tags?: string[];
  statusLog?: Array<{
    previousStatus?: string;
    newStatus: string;
    timestamp: string;
    updatedBy: string;
  }>;
  lastUpdated?: string;
  userAgent?: string;
  source?: string;
  ipAddress?: string;
  $createdAt: string;
  $updatedAt: string;
}

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { user } = useAdminAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);

  // Form state
  const [status, setStatus] = useState<'new' | 'read' | 'replied' | 'archived'>('new');
  const [priority, setPriority] = useState<number>(3);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Fetch submission directly from Appwrite
  const fetchSubmission = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Import the submissions service
      const { submissionsService } = await import('@/lib/appwrite/submissions');

      // Fetch the submission by ID
      const result = await submissionsService.getSubmission(id);

      // Update state with the result
      setSubmission(result);
    } catch (error: unknown) {
      setError('An error occurred while fetching the submission');
      console.error('Fetch error:', error);

      // If there's an authentication error, redirect to login
      if (error && typeof error === 'object' && 'code' in error && error.code === 401) {
        router.push('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  // Fetch submission when user and id are available
  useEffect(() => {
    if (user && id) {
      fetchSubmission();
    }
  }, [user, id, fetchSubmission]);

  // Update form state when submission changes
  useEffect(() => {
    if (submission) {
      setStatus(submission.status || 'new');
      setPriority(submission.priority || 3);
      setTags(submission.tags || []);
    }
  }, [submission]);

  // Save changes to the submission
  const saveChanges = async () => {
    if (!id || !submission || !user) return;

    setIsSaving(true);
    setError(null);

    try {
      // Import the submissions service
      const { submissionsService } = await import('@/lib/appwrite/submissions');

      // Prepare update data
      const updateData: {
        status?: 'new' | 'read' | 'replied' | 'archived';
        priority?: number;
        tags?: string[];
      } = {};

      // Only include fields that have changed
      if (status !== (submission.status || 'new')) {
        updateData.status = status;
      }

      if (priority !== (submission.priority || 3)) {
        updateData.priority = priority;
      }

      // Compare tags arrays
      const tagsChanged =
        tags.length !== (submission.tags?.length || 0) ||
        tags.some((tag, i) => tag !== (submission.tags || [])[i]);

      if (tagsChanged) {
        updateData.tags = tags;
      }

      // If nothing has changed, don't make the API call
      if (Object.keys(updateData).length === 0) {
        setIsSaving(false);
        return;
      }

      // Update the submission directly in Appwrite
      // Note: This would require adding an updateSubmission method to the submissions service
      // For now, we'll just refetch the submission
      await submissionsService.updateSubmission(id, updateData);

      // Refetch the submission to get the latest data
      fetchSubmission();
    } catch (error: unknown) {
      setError('An error occurred while updating the submission');
      console.error('Update error:', error);

      // If there's an authentication error, redirect to login
      if (error && typeof error === 'object' && 'code' in error && error.code === 401) {
        router.push('/admin/login');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new tag
  const addTag = () => {
    if (!newTag.trim()) return;

    // Don't add duplicate tags
    if (tags.includes(newTag.trim())) {
      setNewTag('');
      return;
    }

    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Handle back button
  const handleBack = () => {
    router.push('/admin/submissions');
  };

  // Handle email reply
  const handleEmailReply = () => {
    if (!submission) return;

    // Create mailto link
    const subject = `Re: ${submission.subject}`;
    const body = `\n\n-------- Original Message --------\nFrom: ${submission.name}\nEmail: ${submission.email}\nDate: ${formatDate(submission.$createdAt)}\nSubject: ${submission.subject}\n\n${submission.message}`;

    window.location.href = `mailto:${submission.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Update status to replied if it's not already
    if (status !== 'replied') {
      setStatus('replied');
      saveChanges();
    }
  };

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Submissions
          </Button>
        </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading submission...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : submission ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{submission.subject}</CardTitle>
                <CardDescription>
                  From {submission.name} ({submission.email})
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="message">
                  <TabsList>
                    <TabsTrigger value="message">Message</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="message" className="pt-4">
                    <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                      {submission.message}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleEmailReply}
                        className="flex-1"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Reply via Email
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStatus('archived')}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="pt-4">
                    {submission.statusLog && submission.statusLog.length > 0 ? (
                      <div className="space-y-4">
                        {submission.statusLog.map((log, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm">
                                Status changed from <span className="font-medium">{log.previousStatus || 'none'}</span> to <span className="font-medium">{log.newStatus}</span>
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{formatDate(log.timestamp)}</span>
                                <span>•</span>
                                <span>By {log.updatedBy}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No status change history available.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={status}
                      onValueChange={(value: 'new' | 'read' | 'replied' | 'archived') => setStatus(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={priority.toString()}
                      onValueChange={(value) => setPriority(parseInt(value, 10))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Highest</SelectItem>
                        <SelectItem value="2">High</SelectItem>
                        <SelectItem value="3">Medium</SelectItem>
                        <SelectItem value="4">Low</SelectItem>
                        <SelectItem value="5">Lowest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.length === 0 ? (
                        <span className="text-sm text-muted-foreground">No tags</span>
                      ) : (
                        tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        disabled={!newTag.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{formatDate(submission.$createdAt)}</span>
                    </div>

                    {submission.lastUpdated && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Last updated:</span>
                        <span>{formatDate(submission.lastUpdated)}</span>
                      </div>
                    )}

                    {submission.source && (
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Source:</span>
                        <span>{submission.source}</span>
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <Button
                    className="w-full"
                    onClick={saveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
    </ProtectedRoute>
  );
}