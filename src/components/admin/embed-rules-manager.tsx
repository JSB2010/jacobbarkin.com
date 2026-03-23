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

type RuleConditionDraft = {
  exactUrls: string;
  hosts: string;
  pathPrefixes: string;
  pathRegex: string;
  queryContains: string;
  referrerHosts: string;
  utmSources: string;
  utmMediums: string;
  utmCampaigns: string;
  deviceTypes: string;
  languages: string;
  installationIds: string;
  siteKeys: string;
  timezoneOffsets: string;
};

type RuleActionDraft = {
  redirectUrl: string;
  creditVariant: string;
  creditTheme: string;
  creditSize: string;
  creditAlign: string;
  title: string;
  body: string;
  accentLabel: string;
  ctaLabel: string;
  ctaHref: string;
  legalText: string;
};

const defaultRule: Rule = {
  id: "",
  name: "",
  status: "draft",
  priority: 100,
  match_type: "conditions",
  conditions_json: "{}",
  action_type: "page_takeover",
  template_id: "system:maintenance",
  unsafe_html: "",
  config_json: "{}",
  rollout_percent: 100,
  start_at: "",
  end_at: "",
  notes: "",
};

const defaultConditionDraft: RuleConditionDraft = {
  exactUrls: "",
  hosts: "",
  pathPrefixes: "",
  pathRegex: "",
  queryContains: "",
  referrerHosts: "",
  utmSources: "",
  utmMediums: "",
  utmCampaigns: "",
  deviceTypes: "",
  languages: "",
  installationIds: "",
  siteKeys: "",
  timezoneOffsets: "",
};

const defaultActionDraft: RuleActionDraft = {
  redirectUrl: "",
  creditVariant: "",
  creditTheme: "",
  creditSize: "",
  creditAlign: "",
  title: "Scheduled maintenance",
  body: "We will be back shortly.",
  accentLabel: "",
  ctaLabel: "Status page",
  ctaHref: "#",
  legalText: "",
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

function safeParseObject(value: string | null) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function parseLineList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumberLineList(value: string) {
  return value
    .split("\n")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

function parseQueryLines(value: string) {
  return Object.fromEntries(
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) return null;
        const key = line.slice(0, separatorIndex).trim();
        const itemValue = line.slice(separatorIndex + 1).trim();
        if (!key || !itemValue) return null;
        return [key, itemValue] as const;
      })
      .filter((entry): entry is readonly [string, string] => Boolean(entry))
  );
}

function joinList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).join("\n")
    : "";
}

function joinNumberList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number" && Number.isFinite(item)).join("\n")
    : "";
}

function joinQueryObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => typeof item === "string" && item.trim().length > 0)
    .map(([key, item]) => `${key}=${item}`)
    .join("\n");
}

function getConditionDraft(rule: Rule): RuleConditionDraft {
  const conditions = safeParseObject(rule.conditions_json);
  const exactUrlList = [
    ...(typeof conditions.exact_url === "string" && conditions.exact_url.trim() ? [conditions.exact_url] : []),
    ...(Array.isArray(conditions.exact_urls) ? conditions.exact_urls : []),
  ].filter((item): item is string => typeof item === "string" && item.trim().length > 0);

  return {
    exactUrls: exactUrlList.join("\n"),
    hosts: joinList(conditions.hosts),
    pathPrefixes: joinList(conditions.path_prefixes),
    pathRegex: typeof conditions.path_regex === "string" ? conditions.path_regex : "",
    queryContains: joinQueryObject(conditions.query_contains),
    referrerHosts: joinList(conditions.referrer_hosts),
    utmSources: joinList(conditions.utm_sources),
    utmMediums: joinList(conditions.utm_mediums),
    utmCampaigns: joinList(conditions.utm_campaigns),
    deviceTypes: joinList(conditions.device_types),
    languages: joinList(conditions.languages),
    installationIds: joinList(conditions.installation_ids),
    siteKeys: joinList(conditions.site_keys),
    timezoneOffsets: joinNumberList(conditions.timezone_offsets),
  };
}

function getActionDraft(rule: Rule, template: Template | null): RuleActionDraft {
  const config = safeParseObject(rule.config_json);
  const templateConfig =
    config.template_config && typeof config.template_config === "object" && !Array.isArray(config.template_config)
      ? (config.template_config as Record<string, unknown>)
      : config;
  const templateDefaults = safeParseObject(template?.config_json || null);
  const readString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

  return {
    redirectUrl: readString(config.redirect_url),
    creditVariant: readString(config.variant),
    creditTheme: readString(config.theme),
    creditSize: readString(config.size),
    creditAlign: readString(config.align),
    title: readString(templateConfig.title, readString(templateDefaults.title, defaultActionDraft.title)),
    body: readString(templateConfig.body, readString(templateDefaults.body, defaultActionDraft.body)),
    accentLabel: readString(templateConfig.accentLabel, readString(templateDefaults.accentLabel)),
    ctaLabel: readString(templateConfig.ctaLabel, readString(templateDefaults.ctaLabel, defaultActionDraft.ctaLabel)),
    ctaHref: readString(templateConfig.ctaHref, readString(templateDefaults.ctaHref, defaultActionDraft.ctaHref)),
    legalText: readString(templateConfig.legalText, readString(templateDefaults.legalText)),
  };
}

function buildConditionsJson(draft: RuleConditionDraft) {
  const exactUrls = parseLineList(draft.exactUrls);
  const conditions: Record<string, unknown> = {};

  if (exactUrls.length === 1) conditions.exact_url = exactUrls[0];
  if (exactUrls.length > 1) conditions.exact_urls = exactUrls;
  if (parseLineList(draft.hosts).length) conditions.hosts = parseLineList(draft.hosts);
  if (parseLineList(draft.pathPrefixes).length) conditions.path_prefixes = parseLineList(draft.pathPrefixes);
  if (draft.pathRegex.trim()) conditions.path_regex = draft.pathRegex.trim();
  if (Object.keys(parseQueryLines(draft.queryContains)).length) conditions.query_contains = parseQueryLines(draft.queryContains);
  if (parseLineList(draft.referrerHosts).length) conditions.referrer_hosts = parseLineList(draft.referrerHosts);
  if (parseLineList(draft.utmSources).length) conditions.utm_sources = parseLineList(draft.utmSources);
  if (parseLineList(draft.utmMediums).length) conditions.utm_mediums = parseLineList(draft.utmMediums);
  if (parseLineList(draft.utmCampaigns).length) conditions.utm_campaigns = parseLineList(draft.utmCampaigns);
  if (parseLineList(draft.deviceTypes).length) conditions.device_types = parseLineList(draft.deviceTypes);
  if (parseLineList(draft.languages).length) conditions.languages = parseLineList(draft.languages);
  if (parseLineList(draft.installationIds).length) conditions.installation_ids = parseLineList(draft.installationIds);
  if (parseLineList(draft.siteKeys).length) conditions.site_keys = parseLineList(draft.siteKeys);
  if (parseNumberLineList(draft.timezoneOffsets).length) conditions.timezone_offsets = parseNumberLineList(draft.timezoneOffsets);

  return JSON.stringify(conditions);
}

function buildConfigJson(rule: Rule, draft: RuleActionDraft) {
  if (rule.action_type === "redirect") {
    return JSON.stringify(draft.redirectUrl.trim() ? { redirect_url: draft.redirectUrl.trim() } : {});
  }

  if (rule.action_type === "credit_variant_override") {
    return JSON.stringify({
      ...(draft.creditVariant.trim() ? { variant: draft.creditVariant.trim() } : {}),
      ...(draft.creditTheme.trim() ? { theme: draft.creditTheme.trim() } : {}),
      ...(draft.creditSize.trim() ? { size: draft.creditSize.trim() } : {}),
      ...(draft.creditAlign.trim() ? { align: draft.creditAlign.trim() } : {}),
    });
  }

  const templateConfig = {
    ...(draft.title.trim() ? { title: draft.title.trim() } : {}),
    ...(draft.body.trim() ? { body: draft.body.trim() } : {}),
    ...(draft.accentLabel.trim() ? { accentLabel: draft.accentLabel.trim() } : {}),
    ...(draft.ctaLabel.trim() ? { ctaLabel: draft.ctaLabel.trim() } : {}),
    ...(draft.ctaHref.trim() ? { ctaHref: draft.ctaHref.trim() } : {}),
    ...(draft.legalText.trim() ? { legalText: draft.legalText.trim() } : {}),
  };

  return JSON.stringify(Object.keys(templateConfig).length > 0 ? { template_config: templateConfig } : {});
}

function summarizeRuleConditions(rule: Rule) {
  const conditions = safeParseObject(rule.conditions_json);
  const parts: string[] = [];

  const exactUrls = [
    ...(typeof conditions.exact_url === "string" && conditions.exact_url ? [conditions.exact_url] : []),
    ...(Array.isArray(conditions.exact_urls) ? conditions.exact_urls : []),
  ].filter((item): item is string => typeof item === "string" && item.length > 0);

  if (exactUrls.length) parts.push(`${exactUrls.length} exact URL${exactUrls.length > 1 ? "s" : ""}`);
  if (Array.isArray(conditions.hosts) && conditions.hosts.length) parts.push(`${conditions.hosts.length} host${conditions.hosts.length > 1 ? "s" : ""}`);
  if (Array.isArray(conditions.path_prefixes) && conditions.path_prefixes.length) parts.push(`${conditions.path_prefixes.length} path prefix${conditions.path_prefixes.length > 1 ? "es" : ""}`);
  if (typeof conditions.path_regex === "string" && conditions.path_regex) parts.push("regex path");
  if (conditions.query_contains && typeof conditions.query_contains === "object") parts.push("query rules");
  if (Array.isArray(conditions.utm_campaigns) && conditions.utm_campaigns.length) parts.push("UTM filters");
  if (Array.isArray(conditions.device_types) && conditions.device_types.length) parts.push("device filters");
  if (Array.isArray(conditions.site_keys) && conditions.site_keys.length) parts.push("site keys");

  return parts.length > 0 ? parts.join(" · ") : "Matches all traffic";
}

function getTemplateHelperText(template: Template | null) {
  if (!template) {
    return "Choose a template when the rule should render a banner, takeover, or full-page replacement.";
  }

  if (template.is_system === 1) {
    return template.description || "System template with structured content fields below.";
  }

  return template.description || "Custom template selected. The content fields below mainly apply to system templates.";
}

export function EmbedRulesManager() {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule>(defaultRule);
  const [conditionDraft, setConditionDraft] = useState<RuleConditionDraft>(defaultConditionDraft);
  const [actionDraft, setActionDraft] = useState<RuleActionDraft>(defaultActionDraft);
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

  const generatedConditionsJson = useMemo(() => buildConditionsJson(conditionDraft), [conditionDraft]);
  const generatedConfigJson = useMemo(() => buildConfigJson(editingRule, actionDraft), [editingRule, actionDraft]);

  function openRuleEditor(rule: Rule) {
    const normalizedRule = {
      ...defaultRule,
      ...rule,
      start_at: rule.start_at || "",
      end_at: rule.end_at || "",
      unsafe_html: rule.unsafe_html || "",
      notes: rule.notes || "",
      conditions_json: rule.conditions_json || "{}",
      config_json: rule.config_json || "{}",
    };
    const template = templates.find((item) => item.id === normalizedRule.template_id) || null;

    setEditingRule(normalizedRule);
    setConditionDraft(getConditionDraft(normalizedRule));
    setActionDraft(getActionDraft(normalizedRule, template));
    setDialogOpen(true);
  }

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
      const response = await fetch("/api/embed-rules", {
        method: editingRule.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingRule,
          conditions_json: generatedConditionsJson,
          config_json: generatedConfigJson,
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
      setConditionDraft(defaultConditionDraft);
      setActionDraft(defaultActionDraft);
      await loadAll();
    } catch (error) {
      console.error(error);
      toast({
        title: "Could not save rule",
        description: "Check the form fields and try again.",
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
                <Button onClick={() => openRuleEditor(defaultRule)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRule.id ? "Edit rule" : "Create rule"}</DialogTitle>
                  <DialogDescription>
                    Define where this rule runs, what it should do, and how the replacement should look.
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
                    <p className="text-xs text-muted-foreground">Lower numbers run first when multiple rules could match the same page.</p>
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
                    <p className="text-xs text-muted-foreground">Choose whether the rule shows a notice, replaces content, redirects traffic, or restyles the credit embed.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select
                      value={editingRule.template_id || "__none__"}
                      onValueChange={(value) => {
                        const templateId = value === "__none__" ? null : value;
                        const template = templates.find((item) => item.id === templateId) || null;
                        setEditingRule((current) => ({ ...current, template_id: templateId }));
                        setActionDraft((current) => {
                          const defaults = getActionDraft({ ...defaultRule, template_id: templateId, config_json: "{}" }, template);
                          return {
                            ...current,
                            title: current.title || defaults.title,
                            body: current.body || defaults.body,
                            accentLabel: current.accentLabel || defaults.accentLabel,
                            ctaLabel: current.ctaLabel || defaults.ctaLabel,
                            ctaHref: current.ctaHref || defaults.ctaHref,
                            legalText: current.legalText || defaults.legalText,
                          };
                        });
                      }}
                    >
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
                    <p className="text-xs text-muted-foreground">{getTemplateHelperText(selectedTemplate)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Rollout Percent</Label>
                    <Input type="number" min="0" max="100" value={editingRule.rollout_percent} onChange={(event) => setEditingRule((current) => ({ ...current, rollout_percent: Number(event.target.value || 100) }))} />
                    <p className="text-xs text-muted-foreground">Use less than 100 to stage a partial rollout before turning the rule fully on.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Start At</Label>
                    <Input type="datetime-local" value={editingRule.start_at || ""} onChange={(event) => setEditingRule((current) => ({ ...current, start_at: event.target.value }))} />
                    <p className="text-xs text-muted-foreground">Optional. Leave empty to let the rule start immediately when active.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>End At</Label>
                    <Input type="datetime-local" value={editingRule.end_at || ""} onChange={(event) => setEditingRule((current) => ({ ...current, end_at: event.target.value }))} />
                    <p className="text-xs text-muted-foreground">Optional. Leave empty if the rule should continue until you pause it.</p>
                  </div>

                  <div className="space-y-4 rounded-xl border p-4 md:col-span-2">
                    <div>
                      <h3 className="text-sm font-semibold">Where This Rule Runs</h3>
                      <p className="text-xs text-muted-foreground">Only fill the matchers you need. Every filled section must match for the rule to fire.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Exact URLs</Label>
                        <Textarea className="min-h-[96px]" placeholder="One full URL per line" value={conditionDraft.exactUrls} onChange={(event) => setConditionDraft((current) => ({ ...current, exactUrls: event.target.value }))} />
                        <p className="text-xs text-muted-foreground">Best for one-off pages that should match exactly.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Hosts / Domains</Label>
                        <Textarea className="min-h-[96px]" placeholder={"example.com\nwww.example.com"} value={conditionDraft.hosts} onChange={(event) => setConditionDraft((current) => ({ ...current, hosts: event.target.value }))} />
                        <p className="text-xs text-muted-foreground">Use one host per line to cover an entire site.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Path Prefixes</Label>
                        <Textarea className="min-h-[96px]" placeholder={"/pricing\n/blog/"} value={conditionDraft.pathPrefixes} onChange={(event) => setConditionDraft((current) => ({ ...current, pathPrefixes: event.target.value }))} />
                        <p className="text-xs text-muted-foreground">Matches every path that starts with one of these values.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Path Regex</Label>
                        <Input placeholder="^/products/.+" value={conditionDraft.pathRegex} onChange={(event) => setConditionDraft((current) => ({ ...current, pathRegex: event.target.value }))} />
                        <p className="text-xs text-muted-foreground">Advanced matcher for cases where simple prefixes are not enough.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Query Params</Label>
                        <Textarea className="min-h-[96px]" placeholder={"utm_campaign=spring-launch\nref=partner-a"} value={conditionDraft.queryContains} onChange={(event) => setConditionDraft((current) => ({ ...current, queryContains: event.target.value }))} />
                        <p className="text-xs text-muted-foreground">One <code>key=value</code> rule per line. All listed values must be present.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Referrer Hosts</Label>
                        <Textarea className="min-h-[96px]" placeholder={"google.com\nnews.ycombinator.com"} value={conditionDraft.referrerHosts} onChange={(event) => setConditionDraft((current) => ({ ...current, referrerHosts: event.target.value }))} />
                        <p className="text-xs text-muted-foreground">Use this when the rule should match only traffic from specific referrers.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border p-4 md:col-span-2">
                    <div>
                      <h3 className="text-sm font-semibold">Traffic Filters</h3>
                      <p className="text-xs text-muted-foreground">Optional refinements for campaigns, device types, languages, or known installations.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>UTM Sources</Label>
                        <Textarea className="min-h-[84px]" placeholder={"google\nnewsletter"} value={conditionDraft.utmSources} onChange={(event) => setConditionDraft((current) => ({ ...current, utmSources: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>UTM Mediums</Label>
                        <Textarea className="min-h-[84px]" placeholder={"cpc\nemail"} value={conditionDraft.utmMediums} onChange={(event) => setConditionDraft((current) => ({ ...current, utmMediums: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>UTM Campaigns</Label>
                        <Textarea className="min-h-[84px]" placeholder={"spring-launch\nhomepage-test"} value={conditionDraft.utmCampaigns} onChange={(event) => setConditionDraft((current) => ({ ...current, utmCampaigns: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Device Types</Label>
                        <Textarea className="min-h-[84px]" placeholder={"desktop\nmobile\ntablet"} value={conditionDraft.deviceTypes} onChange={(event) => setConditionDraft((current) => ({ ...current, deviceTypes: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Languages</Label>
                        <Textarea className="min-h-[84px]" placeholder={"en-US\nen"} value={conditionDraft.languages} onChange={(event) => setConditionDraft((current) => ({ ...current, languages: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone Offsets</Label>
                        <Textarea className="min-h-[84px]" placeholder={"-300\n-240"} value={conditionDraft.timezoneOffsets} onChange={(event) => setConditionDraft((current) => ({ ...current, timezoneOffsets: event.target.value }))} />
                        <p className="text-xs text-muted-foreground">Minutes from UTC. Useful for rough geo targeting by browser timezone.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Site Keys</Label>
                        <Textarea className="min-h-[84px]" placeholder={"marketing-site\ncustomer-portal"} value={conditionDraft.siteKeys} onChange={(event) => setConditionDraft((current) => ({ ...current, siteKeys: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Installation IDs</Label>
                        <Textarea className="min-h-[84px]" placeholder={"marketing-site\nexample-com"} value={conditionDraft.installationIds} onChange={(event) => setConditionDraft((current) => ({ ...current, installationIds: event.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border p-4 md:col-span-2">
                    <div>
                      <h3 className="text-sm font-semibold">What This Rule Does</h3>
                      <p className="text-xs text-muted-foreground">Fields change based on the action so admins can edit behavior directly instead of writing JSON by hand.</p>
                    </div>

                    {editingRule.action_type === "redirect" ? (
                      <div className="space-y-2">
                        <Label>Redirect URL</Label>
                        <Input placeholder="https://status.example.com" value={actionDraft.redirectUrl} onChange={(event) => setActionDraft((current) => ({ ...current, redirectUrl: event.target.value }))} />
                        <p className="text-xs text-muted-foreground">Visitors matching this rule will be sent here immediately.</p>
                      </div>
                    ) : editingRule.action_type === "credit_variant_override" ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Variant</Label>
                          <Input placeholder="minimal" value={actionDraft.creditVariant} onChange={(event) => setActionDraft((current) => ({ ...current, creditVariant: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <Input placeholder="light" value={actionDraft.creditTheme} onChange={(event) => setActionDraft((current) => ({ ...current, creditTheme: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Size</Label>
                          <Input placeholder="sm" value={actionDraft.creditSize} onChange={(event) => setActionDraft((current) => ({ ...current, creditSize: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Align</Label>
                          <Input placeholder="left" value={actionDraft.creditAlign} onChange={(event) => setActionDraft((current) => ({ ...current, creditAlign: event.target.value }))} />
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label>Headline</Label>
                          <Input value={actionDraft.title} onChange={(event) => setActionDraft((current) => ({ ...current, title: event.target.value }))} />
                          <p className="text-xs text-muted-foreground">Main title shown inside the selected system template.</p>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Body Copy</Label>
                          <Textarea className="min-h-[110px]" value={actionDraft.body} onChange={(event) => setActionDraft((current) => ({ ...current, body: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Accent Label</Label>
                          <Input placeholder="New" value={actionDraft.accentLabel} onChange={(event) => setActionDraft((current) => ({ ...current, accentLabel: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>CTA Label</Label>
                          <Input placeholder="Learn more" value={actionDraft.ctaLabel} onChange={(event) => setActionDraft((current) => ({ ...current, ctaLabel: event.target.value }))} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>CTA URL</Label>
                          <Input placeholder="https://jacobbarkin.com/projects" value={actionDraft.ctaHref} onChange={(event) => setActionDraft((current) => ({ ...current, ctaHref: event.target.value }))} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Legal / Footer Text</Label>
                          <Input placeholder="Optional fine print or ownership note" value={actionDraft.legalText} onChange={(event) => setActionDraft((current) => ({ ...current, legalText: event.target.value }))} />
                        </div>
                      </div>
                    )}

                    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Generated rule payload</p>
                      <p className="mt-1">The rule engine still stores JSON, but the form generates it for you automatically.</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="mb-1 font-medium text-foreground">Conditions</p>
                          <pre className="overflow-x-auto rounded-md border bg-background p-3 text-[11px]">{generatedConditionsJson}</pre>
                        </div>
                        <div>
                          <p className="mb-1 font-medium text-foreground">Action Config</p>
                          <pre className="overflow-x-auto rounded-md border bg-background p-3 text-[11px]">{generatedConfigJson}</pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Unsafe HTML Override</Label>
                    <Textarea
                      className="min-h-[160px] font-mono text-xs"
                      placeholder="Optional advanced override. Leave empty to use the selected template."
                      value={editingRule.unsafe_html || ""}
                      onChange={(event) => setEditingRule((current) => ({ ...current, unsafe_html: event.target.value }))}
                    />
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>Unsafe HTML bypasses structured rendering. Use it only when a system or structured template cannot express the output you need.</span>
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
              <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
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
                            {rule.template_id || "No template"} · {summarizeRuleConditions(rule)} {rule.start_at ? `· starts ${formatDate(rule.start_at)}` : ""}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={rule.status === "active" ? "default" : "outline"}>{rule.status}</Badge></TableCell>
                        <TableCell>{rule.action_type}</TableCell>
                        <TableCell className="text-right">{rule.priority}</TableCell>
                        <TableCell className="text-right">{Number(rule.replacements_applied || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{Number(rule.errors || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openRuleEditor(rule)}>
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
