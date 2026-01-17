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
import { Loader2, Plus, Trash2, Edit, Code2, FileText, File, Eye, Clock, Info } from 'lucide-react';
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
  maintenance: {
    name: 'Maintenance Mode',
    description: 'Professional maintenance page',
    generate: () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { text-align: center; max-width: 600px; }
    .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      animation: pulse 2s ease-in-out infinite;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #60a5fa, #34d399);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      font-size: 1.125rem;
      line-height: 1.75;
      color: #a1a1aa;
      margin-bottom: 0.5rem;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @media (max-width: 640px) {
      h1 { font-size: 2rem; }
      p { font-size: 1rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔧</div>
    <h1>Under Maintenance</h1>
    <p>We're currently performing scheduled maintenance.</p>
    <p>We'll be back online shortly!</p>
  </div>
</body>
</html>`,
  },
  coming_soon: {
    name: 'Coming Soon',
    description: 'Modern coming soon page',
    generate: () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coming Soon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #0a0a0a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #0a0a0a; color: #fafafa; }
    }
    .container { text-align: center; max-width: 700px; }
    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #3b82f6, #10b981);
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 9999px;
      margin-bottom: 2rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      letter-spacing: -0.025em;
      line-height: 1.1;
    }
    p {
      font-size: 1.25rem;
      line-height: 1.75;
      color: #71717a;
      margin-bottom: 1rem;
    }
    @media (max-width: 640px) {
      h1 { font-size: 2.5rem; }
      p { font-size: 1.125rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Coming Soon</div>
    <h1>Something Amazing Is On The Way</h1>
    <p>We're working hard to bring you something special.</p>
    <p>Stay tuned!</p>
  </div>
</body>
</html>`,
  },
  custom_message: {
    name: 'Custom Message',
    description: 'A modern, professional message page',
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
    
    /* CSS Variables for theming */
    :root {
      --bg: #ffffff;
      --fg: #0a0a0a;
      --card-bg: #ffffff;
      --card-border: #e5e7eb;
      --muted: #71717a;
      --gradient-from: #3b82f6;
      --gradient-mid: #06b6d4;
      --gradient-to: #10b981;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0a0a0a;
        --fg: #fafafa;
        --card-bg: #18181b;
        --card-border: #27272a;
        --muted: #a1a1aa;
        --gradient-from: #60a5fa;
        --gradient-mid: #22d3ee;
        --gradient-to: #34d399;
        --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.2);
        --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
        --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
      }
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg);
      color: var(--fg);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .container {
      width: 100%;
      max-width: 42rem;
      position: relative;
    }
    
    /* Gradient decoration */
    .gradient-bg {
      position: absolute;
      inset: -4rem;
      background: linear-gradient(135deg, var(--gradient-from), var(--gradient-mid), var(--gradient-to));
      opacity: 0.05;
      filter: blur(80px);
      pointer-events: none;
      z-index: -1;
    }
    
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1rem;
      box-shadow: var(--shadow-lg);
      padding: 3rem 2.5rem;
      position: relative;
      overflow: hidden;
    }
    
    /* Gradient accent bar */
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--gradient-from), var(--gradient-mid), var(--gradient-to));
    }
    
    /* Subtle corner accent */
    .card::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle at top right, var(--gradient-to), transparent 70%);
      opacity: 0.06;
      pointer-events: none;
    }
    
    .content {
      position: relative;
      z-index: 1;
      text-align: center;
    }
    
    .content h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }
    
    .content h2 {
      font-size: 1.875rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
      letter-spacing: -0.025em;
      line-height: 1.3;
    }
    
    .content h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      letter-spacing: -0.025em;
      line-height: 1.4;
    }
    
    .content p {
      font-size: 1.125rem;
      line-height: 1.75;
      color: var(--muted);
      margin-bottom: 1rem;
    }
    
    .content p:last-child {
      margin-bottom: 0;
    }
    
    /* Gradient text for <strong> tags */
    .content strong {
      background: linear-gradient(135deg, var(--gradient-from), var(--gradient-mid), var(--gradient-to));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 600;
    }
    
    /* Link styling */
    .content a {
      color: var(--gradient-from);
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }
    
    .content a:hover {
      border-bottom-color: var(--gradient-from);
    }
    
    /* Utility classes for common patterns */
    .content .lead {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
    }
    
    .content .small {
      font-size: 0.875rem;
      margin-top: 1.5rem;
    }
    
    @media (max-width: 640px) {
      body {
        padding: 1rem;
      }
      
      .card {
        padding: 2rem 1.5rem;
      }
      
      .content h1 {
        font-size: 1.875rem;
      }
      
      .content h2 {
        font-size: 1.5rem;
      }
      
      .content h3 {
        font-size: 1.25rem;
      }
      
      .content p {
        font-size: 1rem;
      }
      
      .content .lead {
        font-size: 1.125rem;
      }
    }
    
    /* Smooth fade-in animation */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .card {
      animation: fadeIn 0.6s ease-out;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="gradient-bg"></div>
    <div class="card">
      <div class="content">
        ${customText}
      </div>
    </div>
  </div>
</body>
</html>`,
  },
};

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  // For older dates, show the actual date
  return date.toLocaleDateString();
}

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
      await fetchRules(); // Wait for refetch to complete
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save rule',
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

    setDeletingId(id);
    try {
      const response = await fetch(`/api/embed-custom-content?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete rule');
      }

      // Optimistically update UI
      setRules(prev => prev.filter(r => r.id !== id));

      toast({
        title: 'Success',
        description: 'Rule deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete rule',
        variant: 'destructive',
      });
      // Refetch on error to ensure consistency
      await fetchRules();
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (rule: CustomContentRule) => {
    setTogglingId(rule.id);
    const newActiveState = rule.is_active === 1 ? 0 : 1;
    
    try {
      const response = await fetch('/api/embed-custom-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rule.id,
          is_active: newActiveState,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to toggle rule');
      }

      // Optimistically update UI
      setRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, is_active: newActiveState } : r
      ));

      toast({
        title: 'Success',
        description: newActiveState === 1 ? 'Rule activated' : 'Rule deactivated',
      });
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle rule',
        variant: 'destructive',
      });
      // Refetch on error to ensure consistency
      await fetchRules();
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <CardTitle>Custom Content Replacement</CardTitle>
            <CardDescription>
              Replace page content with custom HTML when the embed loads on specific domains or URLs
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <Clock className="h-3 w-3" />
                Cache: 60s
              </div>
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                Changes take effect within 60 seconds
              </div>
            </div>
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
                    <TabsList className="grid w-full grid-cols-3 h-auto gap-1">
                      <TabsTrigger value="blank_white" className="flex items-center gap-1.5">
                        <File className="h-3.5 w-3.5" />
                        <span className="text-xs">Blank White</span>
                      </TabsTrigger>
                      <TabsTrigger value="blank_black" className="flex items-center gap-1.5">
                        <File className="h-3.5 w-3.5" />
                        <span className="text-xs">Blank Black</span>
                      </TabsTrigger>
                      <TabsTrigger value="maintenance" className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-xs">Maintenance</span>
                      </TabsTrigger>
                      <TabsTrigger value="coming_soon" className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-xs">Coming Soon</span>
                      </TabsTrigger>
                      <TabsTrigger value="custom_message" className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-xs">Custom Message</span>
                      </TabsTrigger>
                      <TabsTrigger value="custom" className="flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Custom HTML</span>
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

                    <TabsContent value="maintenance" className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Professional maintenance mode page with animated icon and gradient text
                      </p>
                    </TabsContent>

                    <TabsContent value="coming_soon" className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Modern coming soon page with badge and large heading
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
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
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
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span title={new Date(rule.updated_at).toLocaleString()}>
                          {formatRelativeTime(rule.updated_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.is_active === 1}
                        onCheckedChange={() => handleToggleActive(rule)}
                        disabled={togglingId === rule.id}
                      />
                      {togglingId === rule.id && (
                        <Loader2 className="h-3 w-3 animate-spin inline-block ml-2" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(rule)}
                          disabled={deletingId === rule.id || togglingId === rule.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
                          disabled={deletingId === rule.id || togglingId === rule.id}
                        >
                          {deletingId === rule.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
