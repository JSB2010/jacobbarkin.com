export const EMBED_EVENT_NAMES = [
  "load",
  "impression",
  "click",
  "heartbeat",
  "error",
  "replacement_applied",
  "replacement_skipped",
] as const;

export type EmbedEventName = (typeof EMBED_EVENT_NAMES)[number];

export const EMBED_RULE_STATUSES = [
  "draft",
  "preview",
  "scheduled",
  "active",
  "paused",
  "archived",
] as const;

export type EmbedRuleStatus = (typeof EMBED_RULE_STATUSES)[number];

export const EMBED_RULE_ACTIONS = [
  "banner",
  "inline_replace",
  "page_takeover",
  "redirect",
  "credit_variant_override",
] as const;

export type EmbedRuleAction = (typeof EMBED_RULE_ACTIONS)[number];

export type EmbedRuleConditionSet = {
  exact_url?: string;
  exact_urls?: string[];
  hosts?: string[];
  path_prefixes?: string[];
  path_regex?: string;
  query_contains?: Record<string, string>;
  referrer_hosts?: string[];
  utm_sources?: string[];
  utm_mediums?: string[];
  utm_campaigns?: string[];
  device_types?: string[];
  languages?: string[];
  installation_ids?: string[];
  site_keys?: string[];
  timezone_offsets?: number[];
  require_timezone_offset?: boolean;
};

export type EmbedTemplate = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  schema_json: string | null;
  render_mode: "system" | "structured" | "unsafe_html";
  html_shell: string | null;
  css_theme: string | null;
  config_json: string | null;
  is_system: number;
  version: number;
  created_at: string;
  updated_at: string;
};

export type EmbedRule = {
  id: string;
  name: string;
  status: EmbedRuleStatus;
  priority: number;
  match_type: string;
  conditions_json: string | null;
  action_type: EmbedRuleAction;
  template_id: string | null;
  unsafe_html: string | null;
  config_json: string | null;
  rollout_percent: number;
  start_at: string | null;
  end_at: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EmbedRuleEvaluationContext = {
  url: string;
  host: string;
  path: string;
  referrer: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  language: string | null;
  device_type: string | null;
  timezone_offset: number | null;
  installation_id: string;
  site_key: string | null;
};

export type EmbedRuleEvaluationResult = {
  matched: boolean;
  rule_id: string | null;
  template_id: string | null;
  action_type: EmbedRuleAction | null;
  html: string | null;
  redirect_url: string | null;
  credit_override: Record<string, string> | null;
  explain: string[];
  debug: Record<string, unknown>;
};
