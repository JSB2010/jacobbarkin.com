import type { EmbedTemplate } from "@/lib/embed/types";
import { safeJsonParse } from "@/lib/embed/utils";

type SystemTemplateConfig = {
  title?: string;
  body?: string;
  accentLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  legalText?: string;
};

const now = new Date(0).toISOString();

export const SYSTEM_TEMPLATES: EmbedTemplate[] = [
  {
    id: "system:maintenance",
    name: "Maintenance Notice",
    category: "maintenance",
    description: "A downtime or service maintenance notice.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      ctaLabel: "string?",
      ctaHref: "string?",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "blue",
    config_json: JSON.stringify({
      title: "Scheduled maintenance",
      body: "We will be back shortly.",
      ctaLabel: "Status page",
      ctaHref: "#",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:promo",
    name: "Launch Promo",
    category: "promo",
    description: "A promotional splash with a CTA.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      accentLabel: "string?",
      ctaLabel: "string",
      ctaHref: "string",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "emerald",
    config_json: JSON.stringify({
      accentLabel: "New",
      title: "See what we launched",
      body: "Explore the latest release and what changed.",
      ctaLabel: "Learn more",
      ctaHref: "#",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:waitlist",
    name: "Waitlist Capture",
    category: "growth",
    description: "A compact waitlist or interest collection page.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      ctaLabel: "string",
      ctaHref: "string",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "violet",
    config_json: JSON.stringify({
      title: "Join the waitlist",
      body: "Get notified when access opens.",
      ctaLabel: "Request access",
      ctaHref: "#",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:case-study",
    name: "Case Study Intro",
    category: "portfolio",
    description: "A project/case-study style announcement.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      ctaLabel: "string?",
      ctaHref: "string?",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "slate",
    config_json: JSON.stringify({
      title: "Case study",
      body: "A closer look at the project and why it was built.",
      ctaLabel: "Read the story",
      ctaHref: "#",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:legal",
    name: "Legal Notice",
    category: "legal",
    description: "A legal or ownership notice template.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      legalText: "string",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "gray",
    config_json: JSON.stringify({
      title: "Notice",
      body: "This page is provided for informational purposes.",
      legalText: "All rights reserved.",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:enhanced-credit",
    name: "Enhanced Credit",
    category: "credit",
    description: "A branded Jacob Barkin credit takeover card.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      ctaLabel: "string?",
      ctaHref: "string?",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "sky",
    config_json: JSON.stringify({
      title: "Designed by Jacob Barkin",
      body: "Product design, frontend systems, and polished delivery.",
      ctaLabel: "View work",
      ctaHref: "https://jacobbarkin.com/projects",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
];

export function getSystemTemplateById(templateId: string | null) {
  if (!templateId) return null;
  return SYSTEM_TEMPLATES.find((template) => template.id === templateId) || null;
}

function escapeHtml(value: string | undefined) {
  return (value || "").replace(/[&<>"']/g, (match) => {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return match;
    }
  });
}

function renderCard(config: SystemTemplateConfig, theme: string) {
  const title = escapeHtml(config.title || "Update");
  const body = escapeHtml(config.body || "");
  const accentLabel = config.accentLabel ? `<span class="pill">${escapeHtml(config.accentLabel)}</span>` : "";
  const cta = config.ctaLabel && config.ctaHref
    ? `<a class="cta" href="${escapeHtml(config.ctaHref)}">${escapeHtml(config.ctaLabel)}</a>`
    : "";
  const legal = config.legalText ? `<p class="legal">${escapeHtml(config.legalText)}</p>` : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      :root {
        --bg: #08111f;
        --card: rgba(10, 18, 32, 0.86);
        --text: #e5eefb;
        --muted: #9fb3cb;
        --accent: ${theme};
        --border: rgba(148, 163, 184, 0.22);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 28%),
          radial-gradient(circle at bottom right, rgba(255,255,255,0.08), transparent 20%),
          linear-gradient(135deg, #020617 0%, #0f172a 55%, #111827 100%);
      }
      .card {
        width: min(720px, 100%);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
        backdrop-filter: blur(18px);
      }
      .pill {
        display: inline-flex;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: white;
        background: linear-gradient(90deg, var(--accent), #38bdf8);
      }
      h1 {
        margin: 18px 0 10px;
        font-size: clamp(28px, 6vw, 48px);
        line-height: 1.02;
      }
      p {
        margin: 0;
        color: var(--muted);
        font-size: 16px;
        line-height: 1.7;
      }
      .cta {
        display: inline-flex;
        margin-top: 24px;
        padding: 12px 18px;
        border-radius: 999px;
        font-weight: 700;
        text-decoration: none;
        color: #08111f;
        background: linear-gradient(90deg, white, #dbeafe);
      }
      .legal {
        margin-top: 18px;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <main class="card">
      ${accentLabel}
      <h1>${title}</h1>
      <p>${body}</p>
      ${cta}
      ${legal}
    </main>
  </body>
</html>`;
}

export function renderTemplate(template: EmbedTemplate, configValue: string | null) {
  if (template.render_mode === "unsafe_html") {
    return template.html_shell || "";
  }

  if (template.render_mode === "structured" && template.html_shell) {
    return template.html_shell;
  }

  const baseConfig = safeJsonParse<SystemTemplateConfig>(template.config_json, {});
  const runtimeConfig = safeJsonParse<SystemTemplateConfig>(configValue, {});
  const config = { ...baseConfig, ...runtimeConfig };
  const theme =
    template.css_theme === "emerald" ? "#34d399" :
    template.css_theme === "violet" ? "#a78bfa" :
    template.css_theme === "slate" ? "#94a3b8" :
    template.css_theme === "gray" ? "#d1d5db" :
    "#38bdf8";

  return renderCard(config, theme);
}
