import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { requireAdmin } from "@/lib/embed/reporting";
import { truncateText } from "@/lib/embed/utils";

type AiStyle = "jacob_barkin" | "none";
type AiSurface = "takeover" | "banner" | "inline";
type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_HTML_LENGTH = 70000;
const MAX_SITE_CONTEXT_LENGTH = 6000;

function coerceStyle(value: unknown): AiStyle {
  return value === "none" ? "none" : "jacob_barkin";
}

function coerceSurface(value: unknown): AiSurface {
  if (value === "banner" || value === "inline" || value === "takeover") return value;
  return "takeover";
}

function coerceMessages(value: unknown): ClientMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-MAX_MESSAGES)
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const item = message as Record<string, unknown>;
      const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
      const content = typeof item.content === "string" ? item.content.trim() : "";
      if (!role || !content) return null;
      return {
        role,
        content: truncateText(content, MAX_MESSAGE_LENGTH),
      };
    })
    .filter((message): message is ClientMessage => Boolean(message));
}

function buildSystemPrompt(style: AiStyle, surface: AiSurface) {
  const surfaceInstructions = {
    takeover:
      "Return a complete standalone HTML document, including <!doctype html>, <html>, <head>, and <body>. This document can replace the host page, so it must be responsive, accessible, and self-contained.",
    banner:
      "Return a complete standalone HTML document for a sandboxed banner iframe. Keep it compact, responsive, and suitable for roughly 140-220px of vertical space unless the user asks otherwise.",
    inline:
      "Return an HTML fragment, not a full document. Include one root element and scoped CSS in a <style> tag so it can replace the credit embed inline inside a shadow-root-like surface.",
  } satisfies Record<AiSurface, string>;

  const styleInstructions =
    style === "jacob_barkin"
      ? [
          "Use the Jacob Barkin site design language from this codebase.",
          "Prefer a true white or very light neutral canvas, deep slate text, vivid sky blue #0ea5e9 as the primary accent, emerald #10b981 as the secondary accent, and blue-to-green gradients for important highlights.",
          "Use Inter/system sans-serif typography, strong but concise headings, readable body copy, subtle uppercase or pill labels only when they clarify hierarchy, and confident CTA buttons.",
          "Panels should feel crisp and modern: translucent white surfaces, rgba(15,23,42,.12) borders, 18-24px radius for large panels, smaller 10-14px radius for controls, and soft layered shadows.",
          "The result should feel like jacobbarkin.com: polished portfolio/product craft, clean spacing, gradient text used sparingly, and no generic stock-template visual clutter.",
        ].join("\n")
      : [
          "Do not apply an opinionated visual style.",
          "Use minimal semantic HTML and only the CSS required for layout/accessibility.",
          "If the user asks for a style in their prompt, follow that style instead of the Jacob Barkin design language.",
        ].join("\n");

  return [
    "You generate custom HTML for an admin rules engine that controls Jacob Barkin's credit embed.",
    "The HTML may be used as a full-page takeover, a sandboxed banner iframe, or an inline replacement, depending on the selected surface.",
    "Continue the conversation naturally: when prior assistant output or current HTML is provided, revise it instead of starting over unless the user asks for a fresh version.",
    surfaceInstructions[surface],
    styleInstructions,
    "Safety and compatibility requirements:",
    "- Output only a strict JSON object with keys: html, summary, notes.",
    "- Do not include Markdown fences or explanatory prose outside JSON.",
    "- The html value must contain the generated HTML string.",
    "- The summary value must be a short sentence describing the revision.",
    "- The notes value must be an array of short strings.",
    "- Do not include <script>, inline event handlers, javascript: URLs, forms that collect sensitive data, tracking pixels, or remote code.",
    "- Avoid remote assets unless the user explicitly provides the exact URL to use. Do not invent logo, image, font, CDN, or brand-asset URLs.",
    "- If a logo or brand mark is needed without an exact supplied asset URL, create a text-based mark or CSS-only badge instead of using a remote image.",
    "- Keep all links intentional and accessible, and use target=\"_blank\" with rel=\"noopener noreferrer\" for external links.",
  ].join("\n\n");
}

function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (host === "localhost" || host === "0.0.0.0" || host === "::1") return false;
    if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return false;
    if (/^169\.254\./.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractTagContent(html: string, pattern: RegExp) {
  const matches = Array.from(html.matchAll(pattern))
    .map((match) => compactWhitespace(match[1] || ""))
    .filter(Boolean);
  return Array.from(new Set(matches)).slice(0, 12);
}

function extractSiteContext(html: string, siteUrl: string) {
  const title = compactWhitespace(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const description = compactWhitespace(
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i)?.[1] ||
      ""
  );
  const headings = extractTagContent(html, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)
    .map((heading) => heading.replace(/<[^>]+>/g, ""));
  const colors = Array.from(new Set((html.match(/#[0-9a-fA-F]{3,8}\b/g) || []).map((color) => color.toLowerCase()))).slice(0, 16);
  const visibleText = compactWhitespace(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).slice(0, 2400);

  return truncateText(
    [
      `Explored URL: ${siteUrl}`,
      title ? `Page title: ${title}` : "",
      description ? `Meta description: ${description}` : "",
      headings.length ? `Headings: ${headings.join(" | ")}` : "",
      colors.length ? `Detected CSS colors: ${colors.join(", ")}` : "",
      visibleText ? `Visible page text excerpt: ${visibleText}` : "",
    ].filter(Boolean).join("\n"),
    MAX_SITE_CONTEXT_LENGTH
  ) || "";
}

async function fetchSiteContext(body: Record<string, unknown>) {
  if (body.explore_site !== true) return "";
  const siteUrl = truncateText(body.site_url, 2048) || "";
  if (!siteUrl || !isPublicHttpUrl(siteUrl)) return "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(siteUrl, {
      headers: {
        "User-Agent": "Jacob Barkin Embed Rule Context Bot",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.toLowerCase().includes("text/html")) return "";
    const html = await response.text();
    return extractSiteContext(html.slice(0, 250000), siteUrl);
  } catch (error) {
    console.warn("Site exploration failed", error);
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function buildContextText(body: Record<string, unknown>, style: AiStyle, surface: AiSurface, siteContext: string) {
  const currentHtml = typeof body.current_html === "string" ? truncateText(body.current_html, MAX_HTML_LENGTH) : "";
  const target = body.target && typeof body.target === "object" ? body.target : {};

  return [
    `Selected surface: ${surface}`,
    `Selected style: ${style === "jacob_barkin" ? "Jacob Barkin styled" : "No style"}`,
    `Rule action type: ${truncateText(body.action_type, 64) || "page_takeover"}`,
    `Target context JSON: ${JSON.stringify(target)}`,
    siteContext ? `Explored target site context:\n${siteContext}` : "Explored target site context: not requested or unavailable",
    currentHtml ? `Current draft HTML to revise:\n${currentHtml}` : "Current draft HTML to revise: none yet",
  ].join("\n\n");
}

function extractJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Gemini did not return JSON");
    }
    return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
  }
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export async function POST(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const style = coerceStyle(body.style);
  const surface = coerceSurface(body.surface);
  const messages = coerceMessages(body.messages);
  const latestPrompt = messages.at(-1);

  if (!latestPrompt || latestPrompt.role !== "user") {
    return NextResponse.json({ error: "A user prompt is required" }, { status: 400 });
  }

  const siteContext = await fetchSiteContext(body);

  const contents = [
    {
      role: "user",
      parts: [{ text: buildContextText(body, style, surface, siteContext) }],
    },
    ...messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    })),
  ];

  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(style, surface) }],
        },
        contents,
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error("Gemini HTML generation failed", detail);
    return NextResponse.json({ error: "Gemini request failed" }, { status: 502 });
  }

  const result = await response.json();
  const text = (result.candidates || [])
    .flatMap((candidate: Record<string, unknown>) => {
      const content = candidate.content as { parts?: { text?: string }[] } | undefined;
      return content?.parts || [];
    })
    .map((part: { text?: string }) => part.text || "")
    .join("\n")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = extractJsonObject(text);
  } catch (error) {
    console.error("Gemini HTML generation returned invalid JSON", error, text);
    return NextResponse.json({ error: "Gemini returned invalid JSON" }, { status: 502 });
  }

  const html = sanitizeHtml(typeof parsed.html === "string" ? parsed.html : "");

  if (!html) {
    return NextResponse.json({ error: "Gemini returned empty HTML" }, { status: 502 });
  }

  if (html.length > MAX_HTML_LENGTH) {
    return NextResponse.json({ error: "Generated HTML is too large" }, { status: 502 });
  }

  const notes = Array.isArray(parsed.notes)
    ? parsed.notes.filter((note): note is string => typeof note === "string").slice(0, 5)
    : [];

  return NextResponse.json({
    html,
    summary: truncateText(typeof parsed.summary === "string" ? parsed.summary : "Generated custom HTML.", 500) || "Generated custom HTML.",
    notes: notes.map((note) => truncateText(note, 300) || note),
  });
}
