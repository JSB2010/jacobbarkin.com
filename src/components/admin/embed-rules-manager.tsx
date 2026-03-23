"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Code2, Eye, FilePlus2, Pencil, PlayCircle, Plus, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

type Template = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  render_mode: string;
  config_json: string | null;
  html_shell: string | null;
  is_system: number;
  version: number;
};

type Rule = {
  id: string;
  name: string;
  status: string;
  priority: number;
  match_type: string;
  conditions_json: string | null;
  action_type: string;
  template_id: string | null;
  unsafe_html: string | null;
  config_json: string | null;
  rollout_percent: number;
  start_at: string | null;
  end_at: string | null;
  notes: string | null;
  replacements_applied?: number;
  replacements_skipped?: number;
  errors?: number;
};

const defaultRule: Rule = {
  id: "",
  name: "",
  status: "draft",
  priority: 100,
  match_type: "conditions",
  conditions_json: JSON.stringify({ hosts: [], path_prefixes: [] }, null, 2),
  action_type: "page_takeover",
  template_id: "system:maintenance",
  unsafe_html: "",
  config_json: JSON.stringify(
    {
      title: "Scheduled maintenance",
      body: "We will be back shortly.",
      ctaLabel: "Status page",
      ctaHref: "#",
    },
    null,
    2
  ),
  rollout_percent: 100,
  start_at: "",
  end_at: "",
  notes: "",
};

const defaultTemplate = {
  name: "",
  category: "custom",
  description: "",
  render_mode: "unsafe_html",
  html_shell: "<!DOCTYPE html><html><body><main><h1>Custom template</h1></main></body></html>",
  config_json: "{}",
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function EmbedRulesManager() {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule>(defaultRule);
  const [templateDraft, setTemplateDraft] = useState(defaultTemplate);
  const [testUrl, setTestUrl] = useState("https://example.com/landing?utm_campaign=spring");
  const [testRuleId, setTestRuleId] = useState<string>("__any__");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewExplain, setPreviewExplain] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === editingRule.template_id) || null,
    [templates, editingRule.template_id]
  );

  async function loadAll() {
    setIsLoading(true);
    try {
      const [rulesResponse, templatesResponse, reportResponse] = await Promise.all([
        fetch("/api/embed-rules"),
        fetch("/api/embed-templates"),
        fetch("/api/embed-report/rules"),
      ]);

      if (!rulesResponse.ok || !templatesResponse.ok || !reportResponse.ok) {
        throw new Error("Failed to load rules manager data");
      }

      const [rulesJson, templatesJson, reportJson] = await Promise.all([
        rulesResponse.json(),
        templatesResponse.json(),
        reportResponse.json(),
      ]);

      const ruleMetrics = new Map<string, Pick<Rule, "replacements_applied" | "replacements_skipped" | "errors">>();
      for (const item of reportJson.rules || []) {
        ruleMetrics.set(item.id, {
          replacements_applied: Number(item.replacements_applied || 0),
          replacements_skipped: Number(item.replacements_skipped || 0),
          errors: Number(item.errors || 0),
        });
      }

      setRules(
        (rulesJson.rules || []).map((rule: Rule) => ({
          ...rule,
          ...ruleMetrics.get(rule.id),
        }))
      );
      setTemplates(templatesJson.templates || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Rules manager failed",
        description: "Could not load rules or templates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveRule() {
    setIsSaving(true);
    try {
      JSON.parse(editingRule.conditions_json || "{}");
      if (editingRule.config_json) {
        JSON.parse(editingRule.config_json);
      }

      const response = await fetch("/api/embed-rules", {
        method: editingRule.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingRule,
          start_at: editingRule.start_at || null,
          end_at: editingRule.end_at || null,
          unsafe_html: editingRule.unsafe_html || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save rule");

      toast({
        title: editingRule.id ? "Rule updated" : "Rule created",
        description: "The rule was saved successfully.",
      });
      setDialogOpen(false);
      setEditingRule(defaultRule);
      await loadAll();
    } catch (error) {
      console.error(error);
      toast({
        title: "Could not save rule",
        description: "Check your JSON fields and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function saveTemplate() {
    try {
      JSON.parse(templateDraft.config_json || "{}");
      const response = await fetch("/api/embed-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateDraft),
      });

      if (!response.ok) throw new Error("Failed to save template");
      toast({
        title: "Template saved",
        description: "The template is now available for rules.",
      });
      setTemplateDialogOpen(false);
      setTemplateDraft(defaultTemplate);
      await loadAll();
    } catch (error) {
      console.error(error);
      toast({
        title: "Could not save template",
        description: "Check the template JSON and try again.",
        variant: "destructive",
      });
    }
  }

  async function deleteRule(ruleId: string) {
    const response = await fetch(`/api/embed-rules?id=${encodeURIComponent(ruleId)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast({
        title: "Delete failed",
        description: "The rule could not be removed.",
        variant: "destructive",
      });
      return;
    }
    await loadAll();
  }

  async function runTest() {
    setIsTesting(true);
    try {
      const response = await fetch("/api/embed-rules/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          testRuleId === "__any__"
            ? { url: testUrl, rule_id: undefined }
            : { url: testUrl, rule_id: testRuleId }
        ),
      });
      if (!response.ok) throw new Error("Failed to preview");
      const result = await response.json();
      setPreviewHtml(result.html || "");
      setPreviewExplain(result.explain || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Preview failed",
        description: "Could not evaluate the rule for that URL.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Rules and Templates</CardTitle>
            <CardDescription>
              Manage safer replacement rules, test matches, and preview template output in a sandbox.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingRule(defaultRule)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRule.id ? "Edit rule" : "Create rule"}</DialogTitle>
                  <DialogDescription>
                    Define structured conditions, action type, schedule, rollout, and template config.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={editingRule.name} onChange={(event) => setEditingRule((current) => ({ ...current, name: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editingRule.status} onValueChange={(value) => setEditingRule((current) => ({ ...current, status: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="preview">Preview</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input type="number" value={editingRule.priority} onChange={(event) => setEditingRule((current) => ({ ...current, priority: Number(event.target.value || 100) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select value={editingRule.action_type} onValueChange={(value) => setEditingRule((current) => ({ ...current, action_type: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="inline_replace">Inline replace</SelectItem>
                        <SelectItem value="page_takeover">Page takeover</SelectItem>
                        <SelectItem value="redirect">Redirect</SelectItem>
                        <SelectItem value="credit_variant_override">Credit variant override</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select value={editingRule.template_id || "__none__"} onValueChange={(value) => setEditingRule((current) => ({ ...current, template_id: value === "__none__" ? null : value }))}>
                      <SelectTrigger><SelectValue placeholder="Choose a template" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No template</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTemplate ? (
                      <p className="text-xs text-muted-foreground">
                        {selectedTemplate.description || `${selectedTemplate.category} template`}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Rollout Percent</Label>
                    <Input type="number" min="0" max="100" value={editingRule.rollout_percent} onChange={(event) => setEditingRule((current) => ({ ...current, rollout_percent: Number(event.target.value || 100) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start At</Label>
                    <Input type="datetime-local" value={editingRule.start_at || ""} onChange={(event) => setEditingRule((current) => ({ ...current, start_at: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>End At</Label>
                    <Input type="datetime-local" value={editingRule.end_at || ""} onChange={(event) => setEditingRule((current) => ({ ...current, end_at: event.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Conditions JSON</Label>
                    <Textarea className="min-h-[180px] font-mono text-xs" value={editingRule.conditions_json || ""} onChange={(event) => setEditingRule((current) => ({ ...current, conditions_json: event.target.value }))} />
                    <p className="text-xs text-muted-foreground">
                      Supported keys include <code>hosts</code>, <code>path_prefixes</code>, <code>path_regex</code>, <code>query_contains</code>, <code>utm_campaigns</code>, <code>device_types</code>, <code>languages</code>, <code>site_keys</code>, and <code>installation_ids</code>.
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Template / Action Config JSON</Label>
                    <Textarea className="min-h-[160px] font-mono text-xs" value={editingRule.config_json || ""} onChange={(event) => setEditingRule((current) => ({ ...current, config_json: event.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Unsafe HTML Override</Label>
                    <Textarea className="min-h-[160px] font-mono text-xs" placeholder="Optional advanced override. Leave empty to use the selected template." value={editingRule.unsafe_html || ""} onChange={(event) => setEditingRule((current) => ({ ...current, unsafe_html: event.target.value }))} />
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>Unsafe HTML bypasses structured rendering. Use it only when a system or structured template cannot express the desired output.</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea value={editingRule.notes || ""} onChange={(event) => setEditingRule((current) => ({ ...current, notes: event.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveRule} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Rule"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create template</DialogTitle>
                  <DialogDescription>Save a reusable custom template for future rules.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={templateDraft.name} onChange={(event) => setTemplateDraft((current) => ({ ...current, name: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={templateDraft.category} onChange={(event) => setTemplateDraft((current) => ({ ...current, category: event.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Input value={templateDraft.description} onChange={(event) => setTemplateDraft((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Render Mode</Label>
                    <Select value={templateDraft.render_mode} onValueChange={(value) => setTemplateDraft((current) => ({ ...current, render_mode: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unsafe_html">Unsafe HTML</SelectItem>
                        <SelectItem value="structured">Structured</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Config JSON</Label>
                    <Textarea value={templateDraft.config_json} onChange={(event) => setTemplateDraft((current) => ({ ...current, config_json: event.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>HTML Shell</Label>
                    <Textarea className="min-h-[180px] font-mono text-xs" value={templateDraft.html_shell} onChange={(event) => setTemplateDraft((current) => ({ ...current, html_shell: event.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveTemplate}>Save Template</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="test">Test & Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="rules">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Priority</TableHead>
                    <TableHead className="text-right">Applied</TableHead>
                    <TableHead className="text-right">Errors</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">Loading rules...</TableCell>
                    </TableRow>
                  ) : rules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">No rules yet</TableCell>
                    </TableRow>
                  ) : (
                    rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {rule.template_id || "No template"} {rule.start_at ? `· starts ${formatDate(rule.start_at)}` : ""}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={rule.status === "active" ? "default" : "outline"}>{rule.status}</Badge></TableCell>
                        <TableCell>{rule.action_type}</TableCell>
                        <TableCell className="text-right">{rule.priority}</TableCell>
                        <TableCell className="text-right">{Number(rule.replacements_applied || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{Number(rule.errors || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingRule({
                                  ...defaultRule,
                                  ...rule,
                                  start_at: rule.start_at || "",
                                  end_at: rule.end_at || "",
                                  unsafe_html: rule.unsafe_html || "",
                                  notes: rule.notes || "",
                                  conditions_json: rule.conditions_json || "{}",
                                  config_json: rule.config_json || "{}",
                                });
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteRule(rule.id)}>
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
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <div key={template.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{template.name}</div>
                    <Badge variant={template.is_system === 1 ? "secondary" : "outline"}>
                      {template.is_system === 1 ? "System" : "Custom"}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {template.description || "No description provided."}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{template.category}</span>
                    <span>·</span>
                    <span>{template.render_mode}</span>
                    <span>·</span>
                    <span>v{template.version}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="test">
            <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
              <div className="space-y-4 rounded-xl border p-4">
                <div className="space-y-2">
                  <Label>Test URL</Label>
                  <Input value={testUrl} onChange={(event) => setTestUrl(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Rule</Label>
                  <Select value={testRuleId} onValueChange={setTestRuleId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__any__">Evaluate all active rules</SelectItem>
                      {rules.map((rule) => (
                        <SelectItem key={rule.id} value={rule.id}>
                          {rule.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={runTest} disabled={isTesting} className="w-full">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {isTesting ? "Testing..." : "Test Match"}
                </Button>
                <div className="rounded-lg bg-muted/60 p-3 text-sm">
                  <div className="mb-2 flex items-center gap-2 font-medium">
                    <Eye className="h-4 w-4" />
                    Why it matched
                  </div>
                  {previewExplain.length === 0 ? (
                    <p className="text-muted-foreground">Run a test to see rule evaluation output.</p>
                  ) : (
                    <ul className="space-y-1 text-muted-foreground">
                      {previewExplain.map((line, index) => (
                        <li key={`${line}-${index}`}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Code2 className="h-4 w-4" />
                  Sandboxed Preview
                </div>
                <iframe
                  title="Rule preview"
                  sandbox="allow-same-origin"
                  srcDoc={previewHtml || "<!DOCTYPE html><html><body style='font-family:system-ui;padding:24px'>Run a test to preview the rendered rule.</body></html>"}
                  className="h-[560px] w-full rounded-xl border bg-white"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
