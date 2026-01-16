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
import { Loader2, Plus, Trash2, Edit, Code2, FileText, File } from 'lucide-react';
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
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
    }
    .message {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 2.5rem;
      margin: 0 0 1rem 0;
      font-weight: 700;
    }
    p {
      font-size: 1.125rem;
      line-height: 1.6;
      margin: 0;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="message">
    ${customText}
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
  }, []);

  const resetForm = () => {
    setUrlPattern('');
    setMatchType('exact');
    setPresetType('custom');
    setCustomText('');
    setContentHtml('');
    setIsActive(true);
    setEditingRule(null);
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

  const handleSubmit = async () => {
    if (!urlPattern || !contentHtml) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

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
                    onChange={(e) => setUrlPattern(e.target.value)}
                    placeholder="example.com/about"
                  />
                  <p className="text-xs text-muted-foreground">
                    The URL or domain to match
                  </p>
                </div>

                {/* Match Type */}
                <div className="space-y-2">
                  <Label htmlFor="match-type">Match Type *</Label>
                  <Select value={matchType} onValueChange={(value: 'exact' | 'domain' | 'regex') => setMatchType(value)}>
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
                        placeholder="Enter your message (supports HTML)"
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground">
                        Displays a centered message with a gradient background. You can use HTML tags.
                      </p>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-2">
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
                <Button onClick={handleSubmit}>
                  {editingRule ? 'Update' : 'Create'} Rule
                </Button>
              </DialogFooter>
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
