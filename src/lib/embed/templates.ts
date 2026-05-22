import type { EmbedTemplate } from "@/lib/embed/types";
import { safeJsonParse } from "@/lib/embed/utils";

type SystemTemplateConfig = {
  title?: string;
  body?: string;
  accentLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  legalText?: string;
  surface?: "takeover" | "banner" | "inline";
};

const now = new Date(0).toISOString();

export const SYSTEM_TEMPLATES: EmbedTemplate[] = [
  {
    id: "system:maintenance",
    name: "Service Interruption",
    category: "maintenance",
    description: "A calm full-page notice for downtime, migrations, and short service windows.",
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
      surface: "takeover",
      accentLabel: "Maintenance",
      title: "This page is temporarily offline",
      body: "We are making a quick update and expect the page to be available again shortly.",
      ctaLabel: "Check status",
      ctaHref: "#",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:promo",
    name: "Launch Announcement",
    category: "promo",
    description: "A polished announcement card for launches, updates, and temporary campaigns.",
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
      surface: "takeover",
      accentLabel: "New",
      title: "See what just launched",
      body: "A short, focused announcement with one clear action for visitors.",
      ctaLabel: "View update",
      ctaHref: "#",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:waitlist",
    name: "Interest Capture",
    category: "growth",
    description: "A compact conversion page for waitlists, early access, or interest forms.",
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
      surface: "takeover",
      accentLabel: "Early access",
      title: "Join the early list",
      body: "Leave your details and get notified when the next release is ready.",
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
    name: "Portfolio Feature",
    category: "portfolio",
    description: "A tasteful portfolio-style takeover for project stories and featured work.",
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
      surface: "takeover",
      accentLabel: "Featured work",
      title: "A closer look at the project",
      body: "Read the process, design decisions, and technical details behind this work.",
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
    name: "Ownership Notice",
    category: "legal",
    description: "A restrained notice for ownership, attribution, compliance, or policy updates.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      legalText: "string",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "gray",
    config_json: JSON.stringify({
      surface: "takeover",
      accentLabel: "Notice",
      title: "Important page notice",
      body: "This page is being shown with a temporary ownership or policy message.",
      legalText: "All rights reserved.",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:enhanced-credit",
    name: "Enhanced Credit Card",
    category: "credit",
    description: "A branded Jacob Barkin credit takeover with a clean call to action.",
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
      surface: "takeover",
      accentLabel: "Credit",
      title: "Designed by Jacob Barkin",
      body: "Product design, frontend systems, and polished delivery for high-quality web experiences.",
      ctaLabel: "View work",
      ctaHref: "https://jacobbarkin.com/projects",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:redirect",
    name: "Redirect Helper",
    category: "routing",
    description: "Starter copy for rules that route visitors to a replacement destination.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      ctaLabel: "string",
      ctaHref: "string",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "amber",
    config_json: JSON.stringify({
      surface: "takeover",
      accentLabel: "Redirect",
      title: "This page has moved",
      body: "Visitors matching this rule should be sent to the updated destination.",
      ctaLabel: "Open destination",
      ctaHref: "#",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:credit-style",
    name: "Credit Style Override",
    category: "credit",
    description: "Reference preset for changing the embedded credit component style on selected sites.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "sky",
    config_json: JSON.stringify({
      surface: "inline",
      accentLabel: "Style override",
      title: "Credit style rule",
      body: "Use a targeted rule to adjust the credit component variant, size, theme, or alignment.",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:banner-announcement",
    name: "Top Banner Announcement",
    category: "banner",
    description: "A slim Jacob Barkin style banner for temporary updates above the page.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      ctaLabel: "string?",
      ctaHref: "string?",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "emerald",
    config_json: JSON.stringify({
      surface: "banner",
      accentLabel: "Update",
      title: "Quick site update",
      body: "A focused message for visitors with one optional action.",
      ctaLabel: "Learn more",
      ctaHref: "#",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:banner-maintenance",
    name: "Top Banner Maintenance",
    category: "banner",
    description: "A compact maintenance strip for known site issues or scheduled work.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      ctaLabel: "string?",
      ctaHref: "string?",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "amber",
    config_json: JSON.stringify({
      surface: "banner",
      accentLabel: "Maintenance",
      title: "Scheduled site work",
      body: "Some features may be unavailable while updates are in progress.",
      ctaLabel: "Status",
      ctaHref: "#",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:inline-credit",
    name: "Inline Credit Card",
    category: "inline",
    description: "A compact card replacement that matches the Jacob Barkin site chrome.",
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
      surface: "inline",
      accentLabel: "Credit",
      title: "Designed by Jacob Barkin",
      body: "Frontend systems, product polish, and accessible web delivery.",
      ctaLabel: "View work",
      ctaHref: "https://jacobbarkin.com/projects",
    }),
    is_system: 1,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "system:inline-cta",
    name: "Inline CTA",
    category: "inline",
    description: "A small inline callout for targeted links, notices, or project redirects.",
    schema_json: JSON.stringify({
      title: "string",
      body: "string",
      ctaLabel: "string?",
      ctaHref: "string?",
    }),
    render_mode: "system",
    html_shell: null,
    css_theme: "violet",
    config_json: JSON.stringify({
      surface: "inline",
      accentLabel: "Recommended",
      title: "Explore the related work",
      body: "A cleaner route to the project, case study, or next page.",
      ctaLabel: "Open",
      ctaHref: "#",
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

function sharedStyles(theme: string) {
  return `
      :root {
        --background: #ffffff;
        --foreground: #171717;
        --muted: #64748b;
        --card: rgba(255, 255, 255, 0.88);
        --primary: #0ea5e9;
        --accent: #10b981;
        --theme: ${theme};
        --border: rgba(15, 23, 42, 0.12);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--foreground);
        background: #ffffff;
      }
      .gradient-text {
        background: linear-gradient(90deg, var(--primary), var(--theme), var(--accent));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-weight: 800;
        color: var(--foreground);
      }
      .brand-mark {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        box-shadow: 0 10px 28px rgba(14, 165, 233, 0.24);
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: fit-content;
        padding: 7px 11px;
        border-radius: 999px;
        border: 1px solid rgba(14, 165, 233, 0.18);
        background: rgba(14, 165, 233, 0.08);
        color: var(--primary);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0;
      }
      .pill-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--accent);
      }
      .cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 0 16px;
        border-radius: 12px;
        background: linear-gradient(90deg, var(--primary), var(--accent));
        color: white;
        font-size: 14px;
        font-weight: 800;
        text-decoration: none;
        box-shadow: 0 16px 36px rgba(14, 165, 233, 0.2);
      }
      .legal {
        margin: 18px 0 0;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.6;
      }`;
}

function renderTakeover(config: SystemTemplateConfig, theme: string) {
  const title = escapeHtml(config.title || "Update");
  const body = escapeHtml(config.body || "");
  const accentLabel = config.accentLabel ? `<span class="pill"><span class="pill-dot"></span>${escapeHtml(config.accentLabel)}</span>` : "";
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
      ${sharedStyles(theme)}
      body {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 28px;
        background:
          linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.08)),
          #ffffff;
      }
      .card {
        width: min(840px, 100%);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: clamp(26px, 6vw, 56px);
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.14);
        backdrop-filter: blur(16px);
      }
      h1 {
        margin: 24px 0 14px;
        font-size: clamp(34px, 7vw, 72px);
        line-height: 0.98;
        letter-spacing: 0;
      }
      .body {
        margin: 0;
        color: var(--muted);
        max-width: 680px;
        font-size: clamp(16px, 2vw, 20px);
        line-height: 1.7;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 14px;
        margin-top: 28px;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="brand"><span class="brand-mark"></span><span class="gradient-text">Jacob Barkin</span></div>
      ${accentLabel}
      <h1 class="gradient-text">${title}</h1>
      <p class="body">${body}</p>
      <div class="actions">${cta}</div>
      ${legal}
    </main>
  </body>
</html>`;
}

function renderBanner(config: SystemTemplateConfig, theme: string) {
  const title = escapeHtml(config.title || "Update");
  const body = escapeHtml(config.body || "");
  const accentLabel = config.accentLabel ? `<span class="pill"><span class="pill-dot"></span>${escapeHtml(config.accentLabel)}</span>` : "";
  const cta = config.ctaLabel && config.ctaHref
    ? `<a class="cta" href="${escapeHtml(config.ctaHref)}">${escapeHtml(config.ctaLabel)}</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      ${sharedStyles(theme)}
      body {
        min-height: 180px;
        padding: 18px;
        background: transparent;
      }
      .banner {
        width: 100%;
        min-height: 128px;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 18px;
        border-radius: 18px;
        border: 1px solid rgba(14, 165, 233, 0.2);
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
        padding: 18px 20px;
      }
      h1 {
        margin: 8px 0 4px;
        font-size: clamp(20px, 4vw, 30px);
        line-height: 1.1;
        letter-spacing: 0;
      }
      p {
        margin: 0;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.5;
      }
      @media (max-width: 640px) {
        .banner { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main class="banner">
      <section>
        ${accentLabel}
        <h1 class="gradient-text">${title}</h1>
        <p>${body}</p>
      </section>
      ${cta}
    </main>
  </body>
</html>`;
}

function renderInline(config: SystemTemplateConfig, theme: string) {
  const title = escapeHtml(config.title || "Update");
  const body = escapeHtml(config.body || "");
  const accentLabel = config.accentLabel ? `<span class="jb-pill"><span class="jb-pill-dot"></span>${escapeHtml(config.accentLabel)}</span>` : "";
  const cta = config.ctaLabel && config.ctaHref
    ? `<a class="jb-cta" href="${escapeHtml(config.ctaHref)}">${escapeHtml(config.ctaLabel)}</a>`
    : "";

  return `<style>
  .jb-inline-card {
    box-sizing: border-box;
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 16px 45px rgba(15, 23, 42, 0.12);
    padding: 18px;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #171717;
  }
  .jb-gradient-text {
    background: linear-gradient(90deg, #0ea5e9, ${theme}, #10b981);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .jb-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(14, 165, 233, 0.18);
    background: rgba(14, 165, 233, 0.08);
    color: #0ea5e9;
    font-size: 12px;
    font-weight: 700;
  }
  .jb-pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #10b981;
  }
  .jb-inline-card h2 {
    margin: 12px 0 8px;
    font-size: 24px;
    line-height: 1.12;
    letter-spacing: 0;
  }
  .jb-inline-card p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.6;
  }
  .jb-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    margin-top: 14px;
    padding: 0 14px;
    border-radius: 10px;
    background: linear-gradient(90deg, #0ea5e9, #10b981);
    color: white;
    font-size: 13px;
    font-weight: 800;
    text-decoration: none;
  }
</style>
<article class="jb-inline-card">
  ${accentLabel}
  <h2 class="jb-gradient-text">${title}</h2>
  <p>${body}</p>
  ${cta}
</article>`;
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
    template.css_theme === "amber" ? "#f59e0b" :
    "#38bdf8";

  if (config.surface === "banner") return renderBanner(config, theme);
  if (config.surface === "inline") return renderInline(config, theme);
  return renderTakeover(config, theme);
}
