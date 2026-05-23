"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code2,
  Copy,
  Eye,
  FilePlus2,
  Filter,
  Globe,
  Layers3,
  Pencil,
  PlayCircle,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

type Template = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  schema_json: string | null;
  render_mode: string;
  config_json: string | null;
  html_shell: string | null;
  css_theme: string | null;
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

type SiteOption = {
  installation_id: string;
  site_key: string | null;
  page_host: string;
  label: string | null;
  last_page_url: string | null;
};

type TargetMode = "all_pages" | "exact_url" | "path_prefix";

type RuleTargetDraft = {
  mode: TargetMode;
  domain: string;
  exactUrl: string;
  pathPrefix: string;
};

type RuleConditionDraft = {
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

type TemplateDraft = {
  id: string;
  name: string;
  category: string;
  description: string;
  schema_json: string;
  render_mode: string;
  html_shell: string;
  css_theme: string;
  config_json: string;
  version: number;
};

type WizardStep = "target" | "content" | "review";
type ContentMode = "template" | "custom_html" | "ai_html";
type AiStyle = "jacob_barkin" | "none";
type AiMessage = {
  role: "user" | "assistant";
  content: string;
  html?: string;
  notes?: string[];
};

const defaultRule: Rule = {
  id: "",
  name: "",
  status: "paused",
  priority: 100,
  match_type: "conditions",
  conditions_json: "{}",
  action_type: "page_takeover",
  template_id: "system:enhanced-credit",
  unsafe_html: "",
  config_json: JSON.stringify({ surface: "takeover", title: "Custom template", body: "Template body" }, null, 2),
  rollout_percent: 100,
  start_at: "",
  end_at: "",
  notes: "",
};

const defaultTargetDraft: RuleTargetDraft = {
  mode: "all_pages",
  domain: "",
  exactUrl: "",
  pathPrefix: "/",
};

const defaultConditionDraft: RuleConditionDraft = {
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
};

const defaultActionDraft: RuleActionDraft = {
  redirectUrl: "",
  creditVariant: "chip",
  creditTheme: "auto",
  creditSize: "md",
  creditAlign: "center",
  title: "Designed by Jacob Barkin",
  body: "A focused credit card for product design, frontend systems, and polished delivery.",
  accentLabel: "Credit",
  ctaLabel: "View work",
  ctaHref: "https://jacobbarkin.com/projects",
  legalText: "",
};

const defaultTemplate: TemplateDraft = {
  id: "",
  name: "",
  category: "custom",
  description: "",
  schema_json: JSON.stringify({ title: "string", body: "string" }, null, 2),
  render_mode: "unsafe_html",
  html_shell: "<!DOCTYPE html><html><body><main><h1>Custom template</h1></main></body></html>",
  css_theme: "sky",
  config_json: "{}",
  version: 1,
};

const actionLabels: Record<string, string> = {
  banner: "Banner",
  inline_replace: "Inline replace",
  page_takeover: "Page takeover",
  redirect: "Redirect",
  credit_variant_override: "Credit style",
};

const targetModeLabels: Record<TargetMode, string> = {
  all_pages: "All pages",
  exact_url: "Exact URL",
  path_prefix: "Path prefix",
};

const wizardSteps: { id: WizardStep; label: string; description: string }[] = [
  { id: "target", label: "Target", description: "Choose site and pages" },
  { id: "content", label: "Content", description: "Pick template or custom HTML" },
  { id: "review", label: "Review", description: "Preview and save" },
];

function isRuleEnabled(rule: Pick<Rule, "status">) {
  return rule.status === "active";
}

function getRuleStateLabel(rule: Pick<Rule, "status" | "start_at" | "end_at">) {
  if (isRuleEnabled(rule)) {
    if (rule.start_at && Date.parse(rule.start_at) > Date.now()) return "Enabled, starts later";
    if (rule.end_at && Date.parse(rule.end_at) < Date.now()) return "Ended";
    return "Enabled";
  }
  return "Disabled";
}

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

function stringifyPayload(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseLineList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeHostTarget(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";

  try {
    if (/^https?:\/\//i.test(trimmed)) return new URL(trimmed).hostname.toLowerCase();
    if (trimmed.includes("/")) return new URL(`https://${trimmed}`).hostname.toLowerCase();
    return new URL(`https://${trimmed}`).hostname.toLowerCase();
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0].toLowerCase();
  }
}

function normalizeUrlTarget(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    url.hash = "";
    const pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
    return `${url.protocol}//${url.host.toLowerCase()}${pathname}${url.search}`;
  } catch {
    return trimmed;
  }
}

function normalizePathPrefixTarget(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const path = /^https?:\/\//i.test(trimmed) ? new URL(trimmed).pathname : trimmed;
    return path.startsWith("/") ? path : `/${path}`;
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
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

function joinQueryObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => typeof item === "string" && item.trim().length > 0)
    .map(([key, item]) => `${key}=${item}`)
    .join("\n");
}

function normalizeRule(rule: Rule) {
  return {
    ...defaultRule,
    ...rule,
    start_at: rule.start_at || "",
    end_at: rule.end_at || "",
    unsafe_html: rule.unsafe_html || "",
    notes: rule.notes || "",
    conditions_json: rule.conditions_json || "{}",
    config_json: rule.config_json || "{}",
  };
}

function getTargetDraft(rule: Rule): RuleTargetDraft {
  const conditions = safeParseObject(rule.conditions_json);
  const exactUrls = [
    ...(typeof conditions.exact_url === "string" && conditions.exact_url.trim() ? [conditions.exact_url] : []),
    ...(Array.isArray(conditions.exact_urls) ? conditions.exact_urls : []),
  ].filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  const hosts = joinList(conditions.hosts);
  const pathPrefixes = joinList(conditions.path_prefixes);

  if (exactUrls.length > 0) {
    return {
      ...defaultTargetDraft,
      mode: "exact_url",
      domain: hosts || normalizeHostTarget(exactUrls[0]),
      exactUrl: exactUrls.join("\n"),
    };
  }

  if (pathPrefixes) {
    return {
      ...defaultTargetDraft,
      mode: "path_prefix",
      domain: hosts,
      pathPrefix: pathPrefixes,
    };
  }

  if (hosts) {
    return { ...defaultTargetDraft, mode: "all_pages", domain: hosts };
  }

  return defaultTargetDraft;
}

function getConditionDraft(rule: Rule): RuleConditionDraft {
  const conditions = safeParseObject(rule.conditions_json);

  return {
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
    creditVariant: readString(config.variant, defaultActionDraft.creditVariant),
    creditTheme: readString(config.theme, defaultActionDraft.creditTheme),
    creditSize: readString(config.size, defaultActionDraft.creditSize),
    creditAlign: readString(config.align, defaultActionDraft.creditAlign),
    title: readString(templateConfig.title, readString(templateDefaults.title, defaultActionDraft.title)),
    body: readString(templateConfig.body, readString(templateDefaults.body, defaultActionDraft.body)),
    accentLabel: readString(templateConfig.accentLabel, readString(templateDefaults.accentLabel, defaultActionDraft.accentLabel)),
    ctaLabel: readString(templateConfig.ctaLabel, readString(templateDefaults.ctaLabel, defaultActionDraft.ctaLabel)),
    ctaHref: readString(templateConfig.ctaHref, readString(templateDefaults.ctaHref, defaultActionDraft.ctaHref)),
    legalText: readString(templateConfig.legalText, readString(templateDefaults.legalText)),
  };
}

function buildConditionsObject(target: RuleTargetDraft, draft: RuleConditionDraft) {
  const conditions: Record<string, unknown> = {};

  if (target.mode === "all_pages" && parseLineList(target.domain).length) {
    conditions.hosts = uniqueList(parseLineList(target.domain).map(normalizeHostTarget));
  }

  if (target.mode === "exact_url") {
    const exactUrls = uniqueList(parseLineList(target.exactUrl).map(normalizeUrlTarget));
    if (parseLineList(target.domain).length) conditions.hosts = uniqueList(parseLineList(target.domain).map(normalizeHostTarget));
    if (exactUrls.length === 1) conditions.exact_url = exactUrls[0];
    if (exactUrls.length > 1) conditions.exact_urls = exactUrls;
  }

  if (target.mode === "path_prefix") {
    if (parseLineList(target.domain).length) conditions.hosts = uniqueList(parseLineList(target.domain).map(normalizeHostTarget));
    if (parseLineList(target.pathPrefix).length) conditions.path_prefixes = uniqueList(parseLineList(target.pathPrefix).map(normalizePathPrefixTarget));
  }

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
  return conditions;
}

function buildConditionsJson(target: RuleTargetDraft, draft: RuleConditionDraft) {
  return stringifyPayload(buildConditionsObject(target, draft));
}

function getPrimaryTargetHost(target: RuleTargetDraft) {
  const domainHost = normalizeHostTarget(parseLineList(target.domain)[0] || "");
  if (domainHost) return domainHost;
  if (target.mode === "exact_url") return normalizeHostTarget(parseLineList(target.exactUrl)[0] || "");
  return "";
}

function getSuggestedPreviewUrl(target: RuleTargetDraft) {
  if (target.mode === "exact_url") {
    const exactUrl = normalizeUrlTarget(parseLineList(target.exactUrl)[0] || "");
    if (/^https?:\/\//i.test(exactUrl)) return exactUrl;
  }

  const host = getPrimaryTargetHost(target);
  if (!host) return "https://example.com/";

  if (target.mode === "path_prefix") {
    const prefix = normalizePathPrefixTarget(parseLineList(target.pathPrefix)[0] || "/");
    return `https://${host}${prefix}`;
  }

  return `https://${host}/`;
}

function buildConfigObject(rule: Rule, draft: RuleActionDraft) {
  if (rule.action_type === "redirect") {
    return draft.redirectUrl.trim() ? { redirect_url: draft.redirectUrl.trim() } : {};
  }

  if (rule.action_type === "credit_variant_override") {
    return {
      ...(draft.creditVariant.trim() ? { variant: draft.creditVariant.trim() } : {}),
      ...(draft.creditTheme.trim() ? { theme: draft.creditTheme.trim() } : {}),
      ...(draft.creditSize.trim() ? { size: draft.creditSize.trim() } : {}),
      ...(draft.creditAlign.trim() ? { align: draft.creditAlign.trim() } : {}),
    };
  }

  const templateConfig = {
    ...(draft.title.trim() ? { title: draft.title.trim() } : {}),
    ...(draft.body.trim() ? { body: draft.body.trim() } : {}),
    ...(draft.accentLabel.trim() ? { accentLabel: draft.accentLabel.trim() } : {}),
    ...(draft.ctaLabel.trim() ? { ctaLabel: draft.ctaLabel.trim() } : {}),
    ...(draft.ctaHref.trim() ? { ctaHref: draft.ctaHref.trim() } : {}),
    ...(draft.legalText.trim() ? { legalText: draft.legalText.trim() } : {}),
  };

  return Object.keys(templateConfig).length > 0 ? { template_config: templateConfig } : {};
}

function buildConfigJson(rule: Rule, draft: RuleActionDraft) {
  return stringifyPayload(buildConfigObject(rule, draft));
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
    return template.description || "System template with structured content fields.";
  }

  return template.description || "Custom template selected. Structured fields may not apply.";
}

function getTemplateSurface(template: Template | null) {
  const config = safeParseObject(template?.config_json || null);
  const surface = typeof config.surface === "string" ? config.surface : "";
  if (surface === "banner" || surface === "inline" || surface === "takeover") return surface;
  if (template?.category === "banner") return "banner";
  if (template?.category === "inline") return "inline";
  return "takeover";
}

function actionSurface(actionType: string) {
  if (actionType === "banner") return "banner";
  if (actionType === "inline_replace") return "inline";
  return "takeover";
}

function templateFitsAction(template: Template, actionType: string) {
  if (actionType === "redirect" || actionType === "credit_variant_override") return false;
  return getTemplateSurface(template) === actionSurface(actionType);
}

function getTemplateTone(template: Template) {
  const surface = getTemplateSurface(template);
  if (surface === "banner") return "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20";
  if (surface === "inline") return "border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20";
  if (template.category === "credit") return "border-sky-200 bg-sky-50/70 dark:border-sky-900 dark:bg-sky-950/20";
  if (template.category === "maintenance") return "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20";
  if (template.category === "promo") return "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20";
  if (template.category === "portfolio") return "border-violet-200 bg-violet-50/70 dark:border-violet-900 dark:bg-violet-950/20";
  if (template.category === "legal") return "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/20";
  return "border-border bg-card";
}

function templateToDraft(template: Template): TemplateDraft {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description || "",
    schema_json: template.schema_json || JSON.stringify({ title: "string", body: "string" }, null, 2),
    render_mode: template.render_mode || "unsafe_html",
    html_shell: template.html_shell || "",
    css_theme: template.css_theme || "sky",
    config_json: template.config_json || "{}",
    version: template.version || 1,
  };
}

export function EmbedRulesManager() {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>("target");
  const [contentMode, setContentMode] = useState<ContentMode>("template");
  const [editingRule, setEditingRule] = useState<Rule>(defaultRule);
  const [targetDraft, setTargetDraft] = useState<RuleTargetDraft>(defaultTargetDraft);
  const [conditionDraft, setConditionDraft] = useState<RuleConditionDraft>(defaultConditionDraft);
  const [actionDraft, setActionDraft] = useState<RuleActionDraft>(defaultActionDraft);
  const [aiStyle, setAiStyle] = useState<AiStyle>("jacob_barkin");
  const [aiExploreSite, setAiExploreSite] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiError, setAiError] = useState("");
  const [templateDraft, setTemplateDraft] = useState(defaultTemplate);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [ruleSearch, setRuleSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [actionFilter, setActionFilter] = useState("__all__");
  const [testUrl, setTestUrl] = useState("https://example.com/landing?utm_campaign=spring");
  const [testRuleId, setTestRuleId] = useState<string>("__any__");
  const [draftPreviewUrl, setDraftPreviewUrl] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewExplain, setPreviewExplain] = useState<string[]>([]);
  const [draftPreviewHtml, setDraftPreviewHtml] = useState<string>("");
  const [draftPreviewExplain, setDraftPreviewExplain] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isPreviewingDraft, setIsPreviewingDraft] = useState(false);
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set());
  const [rawJsonMode, setRawJsonMode] = useState(false);
  const [rawConditionsJson, setRawConditionsJson] = useState("{}");
  const [rawConfigJson, setRawConfigJson] = useState("{}");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === editingRule.template_id) || null,
    [templates, editingRule.template_id]
  );

  const generatedConditionsJson = useMemo(
    () => buildConditionsJson(targetDraft, conditionDraft),
    [conditionDraft, targetDraft]
  );
  const generatedConfigJson = useMemo(
    () => buildConfigJson(editingRule, actionDraft),
    [actionDraft, editingRule]
  );
  const suggestedDraftPreviewUrl = useMemo(() => getSuggestedPreviewUrl(targetDraft), [targetDraft]);
  const saveConditionsJson = rawJsonMode ? rawConditionsJson : generatedConditionsJson;
  const saveConfigJson = rawJsonMode ? rawConfigJson : generatedConfigJson;

  const filteredRules = useMemo(() => {
    const query = ruleSearch.trim().toLowerCase();
    return rules.filter((rule) => {
      const matchesQuery =
        !query ||
        rule.name.toLowerCase().includes(query) ||
        (rule.template_id || "").toLowerCase().includes(query) ||
        summarizeRuleConditions(rule).toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "__all__" ||
        (statusFilter === "enabled" && isRuleEnabled(rule)) ||
        (statusFilter === "disabled" && !isRuleEnabled(rule));
      const matchesAction = actionFilter === "__all__" || rule.action_type === actionFilter;
      return matchesQuery && matchesStatus && matchesAction;
    });
  }, [actionFilter, ruleSearch, rules, statusFilter]);

  const actionTemplates = useMemo(
    () => templates.filter((template) => templateFitsAction(template, editingRule.action_type)),
    [editingRule.action_type, templates]
  );

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rulesResponse, templatesResponse, reportResponse, sitesResponse] = await Promise.all([
        fetch("/api/embed-rules"),
        fetch("/api/embed-templates"),
        fetch("/api/embed-report/rules"),
        fetch("/api/embed-report/sites?days=365&limit=100"),
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

      if (sitesResponse.ok) {
        const sitesJson = await sitesResponse.json();
        setSites(sitesJson.sites || []);
      } else {
        setSites([]);
      }
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
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function resetComposer() {
    setEditingRule(defaultRule);
    setTargetDraft(defaultTargetDraft);
    setConditionDraft(defaultConditionDraft);
    setActionDraft(defaultActionDraft);
    setDraftPreviewHtml("");
    setDraftPreviewExplain([]);
    setRawJsonMode(false);
    setRawConditionsJson("{}");
    setRawConfigJson("{}");
    setContentMode("template");
    setAiStyle("jacob_barkin");
    setAiExploreSite(false);
    setAiPrompt("");
    setAiMessages([]);
    setAiError("");
    setWizardStep("target");
    setComposerOpen(false);
  }

  function startNewRule() {
    resetComposer();
    setComposerOpen(true);
  }

  function openRuleEditor(rule: Rule) {
    const normalizedRule = normalizeRule(rule);
    const template = templates.find((item) => item.id === normalizedRule.template_id) || null;

    setEditingRule(normalizedRule);
    setTargetDraft(getTargetDraft(normalizedRule));
    setConditionDraft(getConditionDraft(normalizedRule));
    setActionDraft(getActionDraft(normalizedRule, template));
    setRawConditionsJson(normalizedRule.conditions_json || "{}");
    setRawConfigJson(normalizedRule.config_json || "{}");
    setRawJsonMode(false);
    setContentMode(normalizedRule.unsafe_html ? "custom_html" : "template");
    setAiStyle("jacob_barkin");
    setAiExploreSite(false);
    setAiPrompt("");
    setAiMessages([]);
    setAiError("");
    setWizardStep(normalizedRule.id ? "content" : "target");
    setComposerOpen(true);
    setDraftPreviewHtml("");
    setDraftPreviewExplain([]);
  }

  function duplicateRule(rule: Rule) {
    const normalizedRule = normalizeRule({
      ...rule,
      id: "",
      name: `${rule.name} copy`,
      status: "paused",
    });
    openRuleEditor(normalizedRule);
  }

  function applyTemplate(templateId: string | null) {
    const template = templates.find((item) => item.id === templateId) || null;
    setEditingRule((current) => ({ ...current, template_id: templateId }));
    setActionDraft((current) => {
      const defaults = getActionDraft({ ...defaultRule, template_id: templateId, config_json: "{}" }, template);
      return {
        ...current,
        title: defaults.title,
        body: defaults.body,
        accentLabel: defaults.accentLabel,
        ctaLabel: defaults.ctaLabel,
        ctaHref: defaults.ctaHref,
        legalText: defaults.legalText,
      };
    });
  }

  function openTemplateEditor(template: Template) {
    setEditingTemplateId(template.id);
    setTemplateDraft(templateToDraft(template));
    setTemplateDialogOpen(true);
  }

  function duplicateTemplate(template: Template) {
    setEditingTemplateId(null);
    setTemplateDraft({
      ...templateToDraft(template),
      id: "",
      name: `${template.name} copy`,
    });
    setTemplateDialogOpen(true);
  }

  function validateRawJson() {
    if (!rawJsonMode) return true;
    JSON.parse(rawConditionsJson || "{}");
    if (rawConfigJson) JSON.parse(rawConfigJson);
    return true;
  }

  async function saveRule(statusOverride?: string, options: { closeAfterSave?: boolean } = {}) {
    setIsSaving(true);
    try {
      validateRawJson();
      const status = statusOverride || editingRule.status || "paused";
      const response = await fetch("/api/embed-rules", {
        method: editingRule.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingRule,
          status,
          name: editingRule.name.trim() || `${targetModeLabels[targetDraft.mode]} rule`,
          conditions_json: saveConditionsJson,
          config_json: saveConfigJson,
          start_at: editingRule.start_at || null,
          end_at: editingRule.end_at || null,
          unsafe_html: editingRule.unsafe_html || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save rule");

      const wasEditingExisting = Boolean(editingRule.id);
      const savedRule = {
        ...editingRule,
        status,
        name: editingRule.name.trim() || `${targetModeLabels[targetDraft.mode]} rule`,
        conditions_json: saveConditionsJson,
        config_json: saveConfigJson,
        start_at: editingRule.start_at || null,
        end_at: editingRule.end_at || null,
        unsafe_html: editingRule.unsafe_html || null,
      };

      toast({
        title: editingRule.id ? "Rule updated" : status === "active" ? "Rule enabled" : "Rule created disabled",
        description: "The rule was saved successfully.",
      });
      if (wasEditingExisting && !options.closeAfterSave) {
        setEditingRule(savedRule);
      } else {
        resetComposer();
      }
      await loadAll();
    } catch (error) {
      console.error(error);
      toast({
        title: "Could not save rule",
        description: rawJsonMode ? "Check the raw JSON fields and try again." : "Check the form fields and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function saveTemplate() {
    try {
      if (templateDraft.schema_json) JSON.parse(templateDraft.schema_json || "{}");
      JSON.parse(templateDraft.config_json || "{}");
      const response = await fetch("/api/embed-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...templateDraft,
          id: templateDraft.id || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to save template");
      toast({
        title: "Template saved",
        description: "The template is now available for rules.",
      });
      setTemplateDialogOpen(false);
      setEditingTemplateId(null);
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

  async function updateRuleEnabled(rule: Rule, enabled: boolean) {
    const nextStatus = enabled ? "active" : "paused";
    setUpdatingStatusIds((current) => new Set(current).add(rule.id));
    try {
      const response = await fetch("/api/embed-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rule,
          status: nextStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update rule status");

      setRules((current) => current.map((item) => (item.id === rule.id ? { ...item, status: nextStatus } : item)));
      if (editingRule.id === rule.id) {
        setEditingRule((current) => ({ ...current, status: nextStatus }));
      }
      toast({
        title: enabled ? "Rule enabled" : "Rule disabled",
        description: `${rule.name} is now ${enabled ? "active" : "paused"}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Status update failed",
        description: "The rule status could not be changed.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusIds((current) => {
        const next = new Set(current);
        next.delete(rule.id);
        return next;
      });
    }
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

  async function previewDraftRule() {
    setIsPreviewingDraft(true);
    try {
      validateRawJson();
      const previewUrl = draftPreviewUrl.trim() || suggestedDraftPreviewUrl;
      const response = await fetch("/api/embed-rules/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: previewUrl,
          rule: {
            ...editingRule,
            conditions_json: saveConditionsJson,
            config_json: saveConfigJson,
            unsafe_html: editingRule.unsafe_html || null,
          },
        }),
      });
      if (!response.ok) throw new Error("Failed to preview draft");
      const result = await response.json();
      setDraftPreviewHtml(result.html || "");
      setDraftPreviewExplain(result.explain || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Draft preview failed",
        description: rawJsonMode ? "Check the raw JSON fields and try again." : "Could not render this draft rule.",
        variant: "destructive",
      });
    } finally {
      setIsPreviewingDraft(false);
    }
  }

  async function generateAiHtml() {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      toast({
        title: "Prompt required",
        description: "Describe what the custom content should say or do.",
        variant: "destructive",
      });
      return;
    }

    const nextMessages: AiMessage[] = [
      ...aiMessages,
      {
        role: "user",
        content: prompt,
      },
    ];

    setIsGeneratingHtml(true);
    setAiError("");
    try {
      const response = await fetch("/api/embed-rules/generate-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: aiStyle,
          surface: actionSurface(editingRule.action_type),
          action_type: editingRule.action_type,
          current_html: editingRule.unsafe_html || "",
          target: {
            mode: targetDraft.mode,
            domain: targetDraft.domain,
            exact_url: targetDraft.exactUrl,
            path_prefix: targetDraft.pathPrefix,
            preview_url: suggestedDraftPreviewUrl,
            conditions: buildConditionsObject(targetDraft, conditionDraft),
          },
          explore_site: aiExploreSite,
          site_url: suggestedDraftPreviewUrl,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.role === "assistant" && message.html
              ? `${message.content}\n\nHTML:\n${message.html}`
              : message.content,
          })),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "HTML generation failed");
      }

      const html = typeof result.html === "string" ? result.html : "";
      const summary = typeof result.summary === "string" ? result.summary : "Generated a custom HTML revision.";
      const notes = Array.isArray(result.notes)
        ? result.notes.filter((note: unknown): note is string => typeof note === "string")
        : [];

      setEditingRule((current) => ({ ...current, unsafe_html: html }));
      setAiMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: summary,
          html,
          notes,
        },
      ]);
      setAiPrompt("");
      toast({
        title: "HTML generated",
        description: "The draft now uses the generated custom HTML.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not generate HTML.";
      setAiError(message);
      toast({
        title: "AI generation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingHtml(false);
    }
  }

  const composerTitle = editingRule.id ? `Edit ${editingRule.name || "rule"}` : "Create rule";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Rules and Templates</CardTitle>
            <CardDescription>
              Add a rule to a site quickly, then open advanced targeting only when it is needed.
            </CardDescription>
          </div>
          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingTemplateId(null);
                  setTemplateDraft(defaultTemplate);
                }}
              >
                <FilePlus2 className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTemplateId ? "Edit template" : "Create template"}</DialogTitle>
                <DialogDescription>
                  Save reusable template content. System templates can be customized here without changing the database schema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Template ID</Label>
                  <Input
                    placeholder="Leave empty for a new ID"
                    value={templateDraft.id}
                    onChange={(event) => setTemplateDraft((current) => ({ ...current, id: event.target.value }))}
                    disabled={Boolean(editingTemplateId)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={templateDraft.name} onChange={(event) => setTemplateDraft((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={templateDraft.category} onChange={(event) => setTemplateDraft((current) => ({ ...current, category: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={templateDraft.css_theme} onValueChange={(value) => setTemplateDraft((current) => ({ ...current, css_theme: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sky">Sky</SelectItem>
                      <SelectItem value="emerald">Emerald</SelectItem>
                      <SelectItem value="violet">Violet</SelectItem>
                      <SelectItem value="slate">Slate</SelectItem>
                      <SelectItem value="gray">Gray</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="space-y-2">
                  <Label>Schema JSON</Label>
                  <Textarea value={templateDraft.schema_json} onChange={(event) => setTemplateDraft((current) => ({ ...current, schema_json: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>HTML Shell</Label>
                  <Textarea className="min-h-[180px] font-mono text-xs" value={templateDraft.html_shell} onChange={(event) => setTemplateDraft((current) => ({ ...current, html_shell: event.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveTemplate}>{editingTemplateId ? "Save Template" : "Create Template"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <div className={composerOpen ? "grid gap-4 xl:grid-cols-[minmax(340px,0.9fr),minmax(460px,1.1fr)]" : "space-y-4"}>
              <div className="space-y-4">
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Layers3 className="h-4 w-4 text-primary" />
                        Saved rules
                      </div>
                      <p className="text-xs text-muted-foreground">{filteredRules.length} of {rules.length} shown</p>
                    </div>
                    <Button size="sm" onClick={startNewRule}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Rule
                    </Button>
                  </div>

                  <div className="grid gap-2 lg:grid-cols-[1fr,140px,160px]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Search rules"
                        value={ruleSearch}
                        onChange={(event) => setRuleSearch(event.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All rules</SelectItem>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All actions</SelectItem>
                        {Object.entries(actionLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  {isLoading ? (
                    <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">Loading rules...</div>
                  ) : filteredRules.length === 0 ? (
                    <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">No matching rules</div>
                  ) : (
                    filteredRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`rounded-lg border bg-card p-4 transition-colors ${editingRule.id === rule.id ? "border-primary/60 bg-primary/5" : "hover:bg-muted/40"}`}
                      >
                        <div className="flex gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="truncate font-medium">{rule.name}</div>
                              <Badge variant={isRuleEnabled(rule) ? "default" : "outline"}>{getRuleStateLabel(rule)}</Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {actionLabels[rule.action_type] || rule.action_type} · {rule.template_id || "No template"}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {summarizeRuleConditions(rule)}
                              {rule.start_at ? ` · starts ${formatDate(rule.start_at)}` : ""}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>{Number(rule.replacements_applied || 0).toLocaleString()} applied</span>
                              <span>·</span>
                              <span>{Number(rule.errors || 0).toLocaleString()} errors</span>
                              <span>·</span>
                              <span>priority {rule.priority}</span>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-3">
                            <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
                              <span className="text-xs font-medium text-muted-foreground">
                                {isRuleEnabled(rule) ? "On" : "Off"}
                              </span>
                              <Switch
                                checked={isRuleEnabled(rule)}
                                disabled={updatingStatusIds.has(rule.id)}
                                onCheckedChange={(checked) => updateRuleEnabled(rule, checked)}
                                className="h-5 w-9"
                                aria-label={`${isRuleEnabled(rule) ? "Disable" : "Enable"} ${rule.name}`}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button variant="default" size="sm" onClick={() => openRuleEditor(rule)} aria-label={`Edit ${rule.name}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => duplicateRule(rule)} aria-label={`Duplicate ${rule.name}`}>
                              <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteRule(rule.id)} aria-label={`Delete ${rule.name}`}>
                              <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {composerOpen ? (
              <div>
                <div className="sticky top-36 space-y-4 rounded-lg border-2 border-primary/30 bg-card p-4 shadow-sm shadow-primary/10">
                    <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {composerTitle}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {editingRule.id
                          ? "Editing this saved rule. Use Target only when you need to change where it applies."
                          : "Pick the site, choose the behavior, preview, and save."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {isRuleEnabled(editingRule) ? "Enabled" : "Disabled"}
                        </span>
                        <Switch
                          checked={isRuleEnabled(editingRule)}
                          onCheckedChange={(checked) => setEditingRule((current) => ({ ...current, status: checked ? "active" : "paused" }))}
                          aria-label={`${isRuleEnabled(editingRule) ? "Disable" : "Enable"} draft rule`}
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={resetComposer}>
                        Close
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    {wizardSteps.map((step, index) => {
                      const active = wizardStep === step.id;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setWizardStep(step.id)}
                          className={`rounded-lg border p-3 text-left transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "bg-background hover:border-primary/40"}`}
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                              {index + 1}
                            </span>
                            {step.label}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  {wizardStep === "target" ? (
                    <>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Rule name</Label>
                      <Input
                        placeholder="Homepage credit update"
                        value={editingRule.name}
                        onChange={(event) => setEditingRule((current) => ({ ...current, name: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Action</Label>
                      <Select
                        value={editingRule.action_type}
                        onValueChange={(value) => {
                          const nextTemplate = templates.find((template) => templateFitsAction(template, value)) || null;
                          setEditingRule((current) => ({
                            ...current,
                            action_type: value,
                            template_id: value === "redirect" || value === "credit_variant_override" ? current.template_id : nextTemplate?.id || null,
                          }));
                          if (nextTemplate) {
                            setActionDraft(getActionDraft({ ...defaultRule, template_id: nextTemplate.id, config_json: "{}" }, nextTemplate));
                          }
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="page_takeover">Page takeover</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="inline_replace">Inline replace</SelectItem>
                          <SelectItem value="redirect">Redirect</SelectItem>
                          <SelectItem value="credit_variant_override">Credit style override</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Globe className="h-4 w-4 text-primary" />
                      Target
                    </div>
                    <div className="space-y-2">
                      <Label>Domain</Label>
                      <Input
                        list="embed-rule-known-sites"
                        placeholder="curriculum.kentdenver.org"
                        value={targetDraft.domain}
                        onChange={(event) => setTargetDraft((current) => ({ ...current, domain: event.target.value }))}
                      />
                      <datalist id="embed-rule-known-sites">
                        {sites.map((site) => (
                          <option key={site.installation_id} value={site.page_host}>
                            {site.label || site.page_host}
                          </option>
                        ))}
                      </datalist>
                      <p className="text-xs text-muted-foreground">Type a domain or choose one of the tracked domains from the browser suggestions.</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Pages</Label>
                      <div className="grid gap-2 md:grid-cols-3">
                        {[
                          { value: "all_pages", label: "All pages", description: "Every page on this domain" },
                          { value: "path_prefix", label: "Path prefix", description: "Only pages under a section" },
                          { value: "exact_url", label: "Exact page", description: "Only one full URL" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setTargetDraft((current) => ({ ...current, mode: option.value as TargetMode }))}
                            className={`rounded-lg border p-3 text-left transition-colors ${targetDraft.mode === option.value ? "border-primary bg-primary/10 text-primary" : "bg-background hover:border-primary/40"}`}
                          >
                            <div className="text-sm font-medium">{option.label}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{option.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {targetDraft.mode === "path_prefix" ? (
                      <div className="space-y-2">
                        <Label>Path prefix</Label>
                        <Input
                          placeholder="/pricing"
                          value={targetDraft.pathPrefix}
                          onChange={(event) => setTargetDraft((current) => ({ ...current, pathPrefix: event.target.value }))}
                        />
                      </div>
                    ) : null}

                    {targetDraft.mode === "exact_url" ? (
                      <div className="space-y-2">
                        <Label>Exact URL</Label>
                        <Input
                          placeholder="https://curriculum.kentdenver.org/course-guide"
                          value={targetDraft.exactUrl}
                          onChange={(event) => setTargetDraft((current) => ({ ...current, exactUrl: event.target.value }))}
                        />
                      </div>
                    ) : null}

                    <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                      Preview/test URL: <span className="font-medium text-foreground">{draftPreviewUrl.trim() || suggestedDraftPreviewUrl}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    {editingRule.id ? (
                      <Button variant="outline" onClick={() => saveRule(undefined, { closeAfterSave: true })} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save changes"}
                      </Button>
                    ) : null}
                    <Button onClick={() => setWizardStep("content")}>
                      Continue to content
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                    </>
                  ) : null}

                  {wizardStep === "content" ? (
                    <>
                  {editingRule.action_type !== "redirect" && editingRule.action_type !== "credit_variant_override" ? (
                    <div className="grid gap-2 lg:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => {
                          setContentMode("template");
                          setEditingRule((current) => ({ ...current, unsafe_html: "" }));
                        }}
                        className={`rounded-lg border p-3 text-left transition-colors ${contentMode === "template" ? "border-primary bg-primary/10" : "bg-background hover:border-primary/40"}`}
                      >
                        <div className="font-medium">Use a premade template</div>
                        <p className="mt-1 text-xs text-muted-foreground">Start from a Jacob Barkin styled template and edit the content fields.</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentMode("custom_html")}
                        className={`rounded-lg border p-3 text-left transition-colors ${contentMode === "custom_html" ? "border-primary bg-primary/10" : "bg-background hover:border-primary/40"}`}
                      >
                        <div className="font-medium">Create custom HTML</div>
                        <p className="mt-1 text-xs text-muted-foreground">Paste a custom page, banner, or inline replacement when templates are not enough.</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentMode("ai_html")}
                        className={`rounded-lg border p-3 text-left transition-colors ${contentMode === "ai_html" ? "border-primary bg-primary/10" : "bg-background hover:border-primary/40"}`}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Sparkles className="h-4 w-4 text-primary" />
                          AI-written content
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Describe the custom content and iterate on the generated HTML.</p>
                      </button>
                    </div>
                  ) : null}

                  {contentMode === "custom_html" && editingRule.action_type !== "redirect" && editingRule.action_type !== "credit_variant_override" ? (
                    <div className="space-y-2 rounded-lg border p-3">
                      <Label>Custom HTML</Label>
                      <Textarea
                        className="min-h-[260px] font-mono text-xs"
                        placeholder="Paste the HTML that should be rendered for this rule."
                        value={editingRule.unsafe_html || ""}
                        onChange={(event) => setEditingRule((current) => ({ ...current, unsafe_html: event.target.value }))}
                      />
                    </div>
                  ) : null}

                  {contentMode === "ai_html" && editingRule.action_type !== "redirect" && editingRule.action_type !== "credit_variant_override" ? (
                    <div className="space-y-4 rounded-lg border p-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Sparkles className="h-4 w-4 text-primary" />
                            AI HTML generator
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Gemini will generate a {actionSurface(editingRule.action_type)} draft and keep this chat as revision context.
                          </p>
                        </div>
                        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
                          <Button
                            type="button"
                            variant={aiStyle === "jacob_barkin" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAiStyle("jacob_barkin")}
                          >
                            Jacob Barkin style
                          </Button>
                          <Button
                            type="button"
                            variant={aiStyle === "none" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAiStyle("none")}
                          >
                            No style
                          </Button>
                        </div>
	                      </div>

                      <label className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
                        <input
                          type="checkbox"
                          checked={aiExploreSite}
                          onChange={(event) => setAiExploreSite(event.target.checked)}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-medium">Explore the target site first</span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Fetches the target URL server-side and gives Gemini the page title, meta description, headings, and visible text/style clues.
                          </span>
                        </span>
                      </label>

                      {aiMessages.length > 0 ? (
                        <div className="space-y-2">
                          {aiMessages.map((message, index) => (
                            <div
                              key={`${message.role}-${index}`}
                              className={`rounded-lg border p-3 text-sm ${
                                message.role === "assistant"
                                  ? "border-sky-200 bg-sky-50/70 dark:border-sky-900 dark:bg-sky-950/20"
                                  : "bg-muted/50"
                              }`}
                            >
                              <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                                {message.role === "assistant" ? "Gemini" : "You"}
                              </div>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              {message.notes?.length ? (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {message.notes.map((note) => (
                                    <Badge key={note} variant="secondary">{note}</Badge>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <Label>{editingRule.unsafe_html ? "Revision prompt" : "Generation prompt"}</Label>
                        <Textarea
                          className="min-h-[120px]"
                          placeholder="Example: Create a full-page launch notice for this client site with a clear headline, short body copy, and a button back to jacobbarkin.com/projects."
                          value={aiPrompt}
                          onChange={(event) => setAiPrompt(event.target.value)}
                        />
                      </div>

                      {aiError ? (
                        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                          {aiError}
                        </div>
                      ) : null}

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                          The generated HTML is applied to this draft and can still be edited before saving.
                        </p>
                        <Button onClick={generateAiHtml} disabled={isGeneratingHtml || !aiPrompt.trim()}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {isGeneratingHtml ? "Generating..." : editingRule.unsafe_html ? "Generate revision" : "Generate HTML"}
                        </Button>
                      </div>

                      {editingRule.unsafe_html ? (
                        <div className="space-y-2">
                          <Label>Generated HTML</Label>
                          <Textarea
                            className="min-h-[220px] font-mono text-xs"
                            value={editingRule.unsafe_html || ""}
                            onChange={(event) => setEditingRule((current) => ({ ...current, unsafe_html: event.target.value }))}
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {contentMode === "template" || editingRule.action_type === "redirect" || editingRule.action_type === "credit_variant_override" ? (
                    <>
                  {editingRule.action_type !== "redirect" && editingRule.action_type !== "credit_variant_override" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <Label>Template</Label>
                          <p className="text-xs text-muted-foreground">{getTemplateHelperText(selectedTemplate)}</p>
                        </div>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {actionTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => applyTemplate(template.id)}
                            className={`rounded-lg border p-3 text-left transition-colors ${getTemplateTone(template)} ${editingRule.template_id === template.id ? "ring-2 ring-primary" : "hover:border-primary/50"}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-medium">{template.name}</div>
                              <Badge variant="secondary">{template.category}</Badge>
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                              {template.description || "Reusable system template."}
                            </p>
                          </button>
                        ))}
                        {actionTemplates.length === 0 ? (
                          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground md:col-span-2">
                            No templates match this action yet. Use custom HTML or create a template with a matching surface in its config JSON.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-3 rounded-lg border p-3">
                    <div className="text-sm font-medium">Rule content</div>
                    {editingRule.action_type === "redirect" ? (
                      <div className="space-y-2">
                        <Label>Redirect URL</Label>
                        <Input
                          placeholder="https://status.example.com"
                          value={actionDraft.redirectUrl}
                          onChange={(event) => setActionDraft((current) => ({ ...current, redirectUrl: event.target.value }))}
                        />
                      </div>
                    ) : editingRule.action_type === "credit_variant_override" ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Variant</Label>
                          <Select value={actionDraft.creditVariant || "__custom__"} onValueChange={(value) => setActionDraft((current) => ({ ...current, creditVariant: value === "__custom__" ? "" : value }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chip">Chip</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="__custom__">Custom value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <Select value={actionDraft.creditTheme || "__custom__"} onValueChange={(value) => setActionDraft((current) => ({ ...current, creditTheme: value === "__custom__" ? "" : value }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto</SelectItem>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="__custom__">Custom value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Size</Label>
                          <Select value={actionDraft.creditSize || "__custom__"} onValueChange={(value) => setActionDraft((current) => ({ ...current, creditSize: value === "__custom__" ? "" : value }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sm">Small</SelectItem>
                              <SelectItem value="md">Medium</SelectItem>
                              <SelectItem value="lg">Large</SelectItem>
                              <SelectItem value="__custom__">Custom value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Align</Label>
                          <Select value={actionDraft.creditAlign || "__custom__"} onValueChange={(value) => setActionDraft((current) => ({ ...current, creditAlign: value === "__custom__" ? "" : value }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                              <SelectItem value="__custom__">Custom value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label>Headline</Label>
                          <Input value={actionDraft.title} onChange={(event) => setActionDraft((current) => ({ ...current, title: event.target.value }))} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Body copy</Label>
                          <Textarea className="min-h-[92px]" value={actionDraft.body} onChange={(event) => setActionDraft((current) => ({ ...current, body: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Accent label</Label>
                          <Input placeholder="New" value={actionDraft.accentLabel} onChange={(event) => setActionDraft((current) => ({ ...current, accentLabel: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>CTA label</Label>
                          <Input placeholder="Learn more" value={actionDraft.ctaLabel} onChange={(event) => setActionDraft((current) => ({ ...current, ctaLabel: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>CTA URL</Label>
                          <Input placeholder="https://jacobbarkin.com/projects" value={actionDraft.ctaHref} onChange={(event) => setActionDraft((current) => ({ ...current, ctaHref: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Footer text</Label>
                          <Input placeholder="Optional fine print" value={actionDraft.legalText} onChange={(event) => setActionDraft((current) => ({ ...current, legalText: event.target.value }))} />
                        </div>
                      </div>
                    )}
                  </div>
                    </>
                  ) : null}

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={() => setWizardStep("target")}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to target
                    </Button>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      {editingRule.id ? (
                        <Button variant="outline" onClick={() => saveRule(undefined, { closeAfterSave: true })} disabled={isSaving}>
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save changes"}
                        </Button>
                      ) : null}
                      <Button onClick={() => setWizardStep("review")}>
                        Continue to review
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                    </>
                  ) : null}

                  {wizardStep === "review" ? (
                    <>
                  <Accordion type="single" collapsible className="rounded-lg border px-3">
                    <AccordionItem value="advanced" className="border-none">
                      <AccordionTrigger className="hover:no-underline">
                        <span className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-primary" />
                          Advanced targeting and payload
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <Input type="number" value={editingRule.priority} onChange={(event) => setEditingRule((current) => ({ ...current, priority: Number(event.target.value || 100) }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Rollout %</Label>
                            <Input type="number" min="0" max="100" value={editingRule.rollout_percent} onChange={(event) => setEditingRule((current) => ({ ...current, rollout_percent: Number(event.target.value || 100) }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Start at</Label>
                            <Input type="datetime-local" value={editingRule.start_at || ""} onChange={(event) => setEditingRule((current) => ({ ...current, start_at: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>End at</Label>
                            <Input type="datetime-local" value={editingRule.end_at || ""} onChange={(event) => setEditingRule((current) => ({ ...current, end_at: event.target.value }))} />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Path regex</Label>
                            <Input placeholder="^/products/.+" value={conditionDraft.pathRegex} onChange={(event) => setConditionDraft((current) => ({ ...current, pathRegex: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Query params</Label>
                            <Textarea className="min-h-[80px]" placeholder={"utm_campaign=spring\nref=partner-a"} value={conditionDraft.queryContains} onChange={(event) => setConditionDraft((current) => ({ ...current, queryContains: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Referrer hosts</Label>
                            <Textarea className="min-h-[80px]" placeholder={"google.com\nnews.ycombinator.com"} value={conditionDraft.referrerHosts} onChange={(event) => setConditionDraft((current) => ({ ...current, referrerHosts: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>UTM campaigns</Label>
                            <Textarea className="min-h-[80px]" placeholder={"spring-launch\nhomepage-test"} value={conditionDraft.utmCampaigns} onChange={(event) => setConditionDraft((current) => ({ ...current, utmCampaigns: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>UTM sources</Label>
                            <Textarea className="min-h-[80px]" placeholder={"google\nnewsletter"} value={conditionDraft.utmSources} onChange={(event) => setConditionDraft((current) => ({ ...current, utmSources: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>UTM mediums</Label>
                            <Textarea className="min-h-[80px]" placeholder={"cpc\nemail"} value={conditionDraft.utmMediums} onChange={(event) => setConditionDraft((current) => ({ ...current, utmMediums: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Device types</Label>
                            <Textarea className="min-h-[80px]" placeholder={"desktop\nmobile\ntablet"} value={conditionDraft.deviceTypes} onChange={(event) => setConditionDraft((current) => ({ ...current, deviceTypes: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Languages</Label>
                            <Textarea className="min-h-[80px]" placeholder={"en-US\nen"} value={conditionDraft.languages} onChange={(event) => setConditionDraft((current) => ({ ...current, languages: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Site keys</Label>
                            <Textarea className="min-h-[80px]" placeholder={"marketing-site\ncustomer-portal"} value={conditionDraft.siteKeys} onChange={(event) => setConditionDraft((current) => ({ ...current, siteKeys: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Installation IDs</Label>
                            <Textarea className="min-h-[80px]" placeholder={"install_123\ninstall_456"} value={conditionDraft.installationIds} onChange={(event) => setConditionDraft((current) => ({ ...current, installationIds: event.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea className="min-h-[80px]" value={editingRule.notes || ""} onChange={(event) => setEditingRule((current) => ({ ...current, notes: event.target.value }))} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
                          <div>
                            <div className="text-sm font-medium">Generated JSON</div>
                            <p className="text-xs text-muted-foreground">The rule engine still stores JSON. You can inspect it or take over raw editing.</p>
                          </div>
                          <Button variant={rawJsonMode ? "default" : "outline"} size="sm" onClick={() => {
                            if (!rawJsonMode) {
                              setRawConditionsJson(generatedConditionsJson);
                              setRawConfigJson(generatedConfigJson);
                            }
                            setRawJsonMode((current) => !current);
                          }}>
                            <Code2 className="mr-2 h-4 w-4" />
                            {rawJsonMode ? "Using raw JSON" : "Edit raw JSON"}
                          </Button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Conditions JSON</Label>
                            {rawJsonMode ? (
                              <Textarea className="min-h-[180px] font-mono text-xs" value={rawConditionsJson} onChange={(event) => setRawConditionsJson(event.target.value)} />
                            ) : (
                              <pre className="max-h-[220px] overflow-auto rounded-md border bg-background p-3 text-xs">{generatedConditionsJson}</pre>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Action config JSON</Label>
                            {rawJsonMode ? (
                              <Textarea className="min-h-[180px] font-mono text-xs" value={rawConfigJson} onChange={(event) => setRawConfigJson(event.target.value)} />
                            ) : (
                              <pre className="max-h-[220px] overflow-auto rounded-md border bg-background p-3 text-xs">{generatedConfigJson}</pre>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="space-y-3 rounded-lg border p-3">
                    <div className="grid gap-3 md:grid-cols-[1fr,auto] md:items-end">
                      <div className="space-y-2">
                        <Label>Test draft against URL</Label>
                        <Input
                          placeholder={suggestedDraftPreviewUrl}
                          value={draftPreviewUrl}
                          onChange={(event) => setDraftPreviewUrl(event.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Used only for this preview. Leave blank to use the current target: {suggestedDraftPreviewUrl}
                        </p>
                      </div>
                      <Button onClick={previewDraftRule} disabled={isPreviewingDraft}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {isPreviewingDraft ? "Previewing..." : "Preview draft"}
                      </Button>
                    </div>
                    {draftPreviewExplain.length > 0 ? (
                      <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                        {draftPreviewExplain.join(" · ")}
                      </div>
                    ) : null}
                    <iframe
                      title="Draft rule preview"
                      sandbox="allow-same-origin"
                      srcDoc={draftPreviewHtml || "<!DOCTYPE html><html><body style='font-family:system-ui;padding:24px;color:#64748b'>Preview this draft to see the rendered template.</body></html>"}
                      className="h-[320px] w-full rounded-lg border bg-white"
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={() => setWizardStep("content")} disabled={isSaving}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to content
                    </Button>
                    {editingRule.id ? (
                      <Button onClick={() => saveRule(undefined, { closeAfterSave: true })} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save changes"}
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => saveRule("paused")} disabled={isSaving}>
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save disabled"}
                        </Button>
                        <Button onClick={() => saveRule("active")} disabled={isSaving}>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save & enable"}
                        </Button>
                      </>
                    )}
                  </div>
                    </>
                  ) : null}
                    </>
                </div>
              </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <div key={template.id} className={`rounded-lg border p-4 ${getTemplateTone(template)}`}>
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
                    <span>{getTemplateSurface(template)}</span>
                    <span>·</span>
                    <span>{template.render_mode}</span>
                    <span>·</span>
                    <span>v{template.version}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openTemplateEditor(template)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateTemplate(template)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="test">
            <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
              <div className="space-y-4 rounded-lg border p-4">
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
                  className="h-[560px] w-full rounded-lg border bg-white"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
