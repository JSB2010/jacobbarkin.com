'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Edit, Code2, FileText, File, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomContentRule {
  id: string;
  url_pattern: string;
  match_type: 'exact' | 'domain' | 'regex';
  content_html: string;
  preset_type: string | null;
  custom_text: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// Preset templates
const PRESET_TEMPLATES = {
  blank_white: {
    name: 'Blank White Page',
    description: 'A completely blank white page',
    generate: () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page</title>
  <style>
    body { margin: 0; padding: 0; background: #ffffff; }
  </style>
</head>
<body></body>
</html>`,
  },
  blank_black: {
    name: 'Blank Black Page',
    description: 'A completely blank black page',
    generate: () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page</title>
  <style>
    body { margin: 0; padding: 0; background: #000000; }
  </style>
</head>
<body></body>
</html>`,
  },
  custom_message: {
    name: 'Custom Message',
    description: 'A centered message on a clean page',
    generate: (customText = 'Your message here') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Auto dark mode detection */
    :root {
      --bg-color: #ffffff;
      --text-color: #1f2937;
      --card-bg: #ffffff;
      --card-border: #e5e7eb;
      --gradient-from: #3b82f6;
      --gradient-to: #10b981;
      --shadow: rgba(0, 0, 0, 0.1);
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #0a0a0a;
        --text-color: #e5e7eb;
        --card-bg: #1a1a1a;
        --card-border: #27272a;
        --gradient-from: #60a5fa;
        --gradient-to: #34d399;
        --shadow: rgba(0, 0, 0, 0.3);
      }
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--bg-color);
      color: var(--text-color);
      line-height: 1.6;
    }
    
    .message {
      text-align: center;
      padding: 3rem 2rem;
      max-width: 600px;
      width: 90%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow);
      position: relative;
      overflow: hidden;
    }
    
    /* Blue-green gradient accent bar at top */
    .message::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(to right, var(--gradient-from), var(--gradient-to));
    }
    
    .content {
      font-size: 1.125rem;
      line-height: 1.75;
      margin-top: 1rem;
    }
    
    .content strong {
      background: linear-gradient(to right, var(--gradient-from), var(--gradient-to));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
    }
    
    @media (max-width: 640px) {
      .message {
        padding: 2rem 1.5rem;
      }
      .content {
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="message">
    <div class="content">
      ${customText}
    </div>
  </div>
</body>
</html>`,
  },
};

export function CustomContentManager() {
  const { toast } = useToast();
  const [rules, setRules] = useState<CustomContentRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomContentRule | null>(null);

  // Form state
  const [urlPattern, setUrlPattern] = useState('');
  const [matchType, setMatchType] = useState<'exact' | 'domain' | 'regex'>('exact');
  const [presetType, setPresetType] = useState<string>('custom');
  const [customText, setCustomText] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [regexError, setRegexError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/embed-custom-content?list=true');
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom content rules',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setUrlPattern('');
    setMatchType('exact');
    setPresetType('custom');
    setCustomText('');
    setContentHtml('');
    setIsActive(true);
    setEditingRule(null);
    setShowPreview(false);
    setRegexError('');
  };

  const handlePresetChange = (preset: string) => {
    setPresetType(preset);
    if (preset === 'custom') {
      return;
    }
    const template = PRESET_TEMPLATES[preset as keyof typeof PRESET_TEMPLATES];
    if (template) {
      if (preset === 'custom_message') {
        const html = template.generate(customText || 'Your message here');
        setContentHtml(html);
      } else {
        const html = template.generate();
        setContentHtml(html);
      }
    }
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    if (presetType === 'custom_message') {
      const template = PRESET_TEMPLATES.custom_message;
      setContentHtml(template.generate(text));
    }
  };

  const validateRegex = (pattern: string): boolean => {
    if (matchType !== 'regex') return true;
    try {
      new RegExp(pattern);
      setRegexError('');
      return true;
    } catch (err) {
      const error = err as Error;
      setRegexError(error.message);
      return false;
    }
  };

  const handleUrlPatternChange = (value: string) => {
    setUrlPattern(value);
    if (matchType === 'regex') {
      validateRegex(value);
    }
  };

  const handleMatchTypeChange = (value: 'exact' | 'domain' | 'regex') => {
    setMatchType(value);
    if (value === 'regex' && urlPattern) {
      validateRegex(urlPattern);
    } else {
      setRegexError('');
    }
  };

  const handleSubmit = async () => {
    if (!urlPattern || !contentHtml) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (matchType === 'regex' && !validateRegex(urlPattern)) {
      toast({
        title: 'Error',
        description: 'Invalid regex pattern',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const method = editingRule ? 'PUT' : 'POST';
      const body: Record<string, unknown> = {
        url_pattern: urlPattern,
        match_type: matchType,
        content_html: contentHtml,
        preset_type: presetType === 'custom' ? null : presetType,
        custom_text: customText || null,
        is_active: isActive ? 1 : 0,
      };

      if (editingRule) {
        body.id = editingRule.id;
      }

      const response = await fetch('/api/embed-custom-content', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save rule');

      toast({
        title: 'Success',
        description: editingRule ? 'Rule updated successfully' : 'Rule created successfully',
      });

      setIsDialogOpen(false);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rule',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rule: CustomContentRule) => {
    setEditingRule(rule);
    setUrlPattern(rule.url_pattern);
    setMatchType(rule.match_type);
    setPresetType(rule.preset_type || 'custom');
    setCustomText(rule.custom_text || '');
    setContentHtml(rule.content_html);
    setIsActive(rule.is_active === 1);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/embed-custom-content?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete rule');

      toast({
        title: 'Success',
        description: 'Rule deleted successfully',
      });

      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (rule: CustomContentRule) => {
    try {
      const response = await fetch('/api/embed-custom-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rule.id,
          is_active: rule.is_active === 1 ? 0 : 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle rule');

      toast({
        title: 'Success',
        description: rule.is_active === 1 ? 'Rule deactivated' : 'Rule activated',
      });

      fetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle rule',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Custom Content Replacement</CardTitle>
            <CardDescription>
              Replace page content with custom HTML when the embed loads on specific domains or URLs
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRule ? 'Edit' : 'Add'} Custom Content Rule</DialogTitle>
                <DialogDescription>
                  Configure when and what content to display
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* URL Pattern */}
                <div className="space-y-2">
                  <Label htmlFor="url-pattern">URL Pattern *</Label>
                  <Input
                    id="url-pattern"
                    value={urlPattern}
                    onChange={(e) => handleUrlPatternChange(e.target.value)}
                    placeholder="example.com/about"
                    className={regexError ? 'border-red-500' : ''}
                  />
                  {regexError && (
                    <p className="text-xs text-red-500">
                      Invalid regex: {regexError}
                    </p>
                  )}
                  {!regexError && (
                    <p className="text-xs text-muted-foreground">
                      The URL or domain to match
                    </p>
                  )}
                </div>

                {/* Match Type */}
                <div className="space-y-2">
                  <Label htmlFor="match-type">Match Type *</Label>
                  <Select value={matchType} onValueChange={handleMatchTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exact">Exact URL</SelectItem>
                      <SelectItem value="domain">Any page on domain</SelectItem>
                      <SelectItem value="regex">Regex pattern</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {matchType === 'exact' && 'Match exact URL (e.g., https://example.com/about)'}
                    {matchType === 'domain' && 'Match any page on the domain (e.g., example.com)'}
                    {matchType === 'regex' && 'Match using regular expression'}
                  </p>
                </div>

                {/* Preset or Custom */}
                <div className="space-y-2">
                  <Label>Content Template</Label>
                  <Tabs value={presetType} onValueChange={handlePresetChange}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="blank_white">
                        <File className="mr-2 h-4 w-4" />
                        Blank White
                      </TabsTrigger>
                      <TabsTrigger value="blank_black">
                        <File className="mr-2 h-4 w-4" />
                        Blank Black
                      </TabsTrigger>
                      <TabsTrigger value="custom_message">
                        <FileText className="mr-2 h-4 w-4" />
                        Custom Message
                      </TabsTrigger>
                      <TabsTrigger value="custom">
                        <Code2 className="mr-2 h-4 w-4" />
                        Custom HTML
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="blank_white" className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Displays a completely blank white page
                      </p>
                    </TabsContent>

                    <TabsContent value="blank_black" className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Displays a completely blank black page
                      </p>
                    </TabsContent>

                    <TabsContent value="custom_message" className="space-y-2">
                      <Label htmlFor="custom-text">Your Message</Label>
                      <Textarea
                        id="custom-text"
                        value={customText}
                        onChange={(e) => handleCustomTextChange(e.target.value)}
                        placeholder="<h1>Welcome</h1><p>Your message here (supports HTML)</p>"
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground">
                        Displays a centered message with site theme colors. You can use HTML tags.
                        Use <code className="text-xs bg-muted px-1 rounded">&lt;strong&gt;</code> for gradient text.
                      </p>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-2">
                      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 mb-3">
                        <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                          <span className="text-lg">⚠️</span>
                          <span>
                            <strong>Security Warning:</strong> Custom HTML will be rendered as-is without sanitization. 
                            Only use trusted HTML content. Malicious scripts could harm visitors.
                          </span>
                        </p>
                      </div>
                      <Label htmlFor="content-html">Custom HTML *</Label>
                      <Textarea
                        id="content-html"
                        value={contentHtml}
                        onChange={(e) => setContentHtml(e.target.value)}
                        placeholder="<!DOCTYPE html>..."
                        rows={12}
                        className="font-mono text-xs"
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter complete HTML document
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="is-active">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                {contentHtml && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPreview(!showPreview)}
                    type="button"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                )}
                <Button onClick={handleSubmit} disabled={!!regexError || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingRule ? 'Update' : 'Create'} Rule</>
                  )}
                </Button>
              </DialogFooter>
              
              {/* Preview iframe */}
              {showPreview && contentHtml && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 text-sm font-medium">Preview</div>
                  <iframe
                    srcDoc={contentHtml}
                    className="w-full h-96 border-0"
                    title="Content Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL Pattern</TableHead>
                <TableHead>Match Type</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    No custom content rules yet. Click &quot;Add Rule&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="font-medium truncate max-w-[300px]" title={rule.url_pattern}>
                        {rule.url_pattern}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {rule.match_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {rule.preset_type ? PRESET_TEMPLATES[rule.preset_type as keyof typeof PRESET_TEMPLATES]?.name || rule.preset_type : 'Custom HTML'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.is_active === 1}
                        onCheckedChange={() => handleToggleActive(rule)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
