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
import { useToast } from '@/components/ui/use-toast';



// Submission type for this page
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
}

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);

  // Form state
  const [status, setStatus] = useState<'new' | 'read' | 'replied' | 'archived'>('new');
  const [priority, setPriority] = useState<number>(3);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Fetch submission from API
  const fetchSubmission = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/submissions?id=${encodeURIComponent(id)}`);

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Session expired',
            description: 'Please sign in again to access submissions.',
            variant: 'destructive',
          });
          router.push('/sign-in');
          return;
        }
        throw new Error('Failed to fetch submission');
      }

      const result = await response.json();
      if (result.submissions && result.submissions.length > 0) {
        const sub = result.submissions[0];
        // Map D1 fields to component fields
        setSubmission({
          $id: sub.id,
          name: sub.name,
          email: sub.email,
          subject: sub.subject,
          message: sub.message,
          timestamp: sub.created_at,
          status: sub.status,
          priority: sub.priority,
          tags: [],
        });
      } else {
        setError('Submission not found');
      }
    } catch (err: unknown) {
      setError('An error occurred while fetching the submission');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, router, toast]);

  // Fetch submission when authenticated and id is available
  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id, fetchSubmission]);

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
    if (!id || !submission) return;

    setIsSaving(true);
    setError(null);

    try {
      // Prepare update data
      const updateData: {
        status?: 'new' | 'read' | 'replied' | 'archived';
        priority?: number;
      } = {};

      // Only include fields that have changed
      if (status !== (submission.status || 'new')) {
        updateData.status = status;
      }

      if (priority !== (submission.priority || 3)) {
        updateData.priority = priority;
      }

      // If nothing has changed, don't make the API call
      if (Object.keys(updateData).length === 0) {
        setIsSaving(false);
        return;
      }

      // Update the submission via API
      const response = await fetch(`/api/admin/submissions?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Session expired',
            description: 'Please sign in again to access submissions.',
            variant: 'destructive',
          });
          router.push('/sign-in');
          return;
        }
        throw new Error('Failed to update submission');
      }

      // Refetch the submission to get the latest data
      fetchSubmission();
    } catch (err: unknown) {
      setError('An error occurred while updating the submission');
      console.error('Update error:', err);
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
    const body = `\n\n-------- Original Message --------\nFrom: ${submission.name}\nEmail: ${submission.email}\nDate: ${formatDate(submission.timestamp || '')}\nSubject: ${submission.subject}\n\n${submission.message}`;

    window.location.href = `mailto:${submission.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Update status to replied if it's not already
    if (status !== 'replied') {
      setStatus('replied');
      saveChanges();
    }
  };

  return (
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
                    <p className="text-muted-foreground">No status change history available.</p>
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
                      <span>{formatDate(submission.timestamp || '')}</span>
                    </div>
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
  );
}
