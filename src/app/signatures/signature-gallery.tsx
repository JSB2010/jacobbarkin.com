'use client';

import { useState } from "react";
import type { SignatureDefinition } from "./signatures-data";

function CopyButton({
  label,
  onCopy,
  active,
}: {
  label: string;
  onCopy: () => Promise<void> | void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 ${active ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-white text-slate-900 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"}`}
    >
      {active ? "Copied" : label}
    </button>
  );
}

function SignatureCard({ signature, siteBase }: { signature: SignatureDefinition; siteBase: string }) {
  const [state, setState] = useState<"" | "html" | "url">("");
  const [email, setEmail] = useState("");
  const rawUrl = `${siteBase}${signature.rawPath}`;
  const hasEmailPlaceholder = signature.html.includes("{{EMAIL}}");

  async function handleCopyHtml() {
    if (hasEmailPlaceholder && !email.trim()) {
      alert("Please enter your email address first.");
      return;
    }
    
    const htmlToCopy = hasEmailPlaceholder 
      ? signature.html.replace(/\{\{EMAIL\}\}/g, email.trim())
      : signature.html;
    
    try {
      await navigator.clipboard.writeText(htmlToCopy);
      setState("html");
      setTimeout(() => setState(""), 1800);
    } catch (error) {
      console.error("Unable to copy HTML", error);
      setState("");
      alert("Copy failed. Select and copy manually from the preview.");
    }
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(rawUrl);
      setState("url");
      setTimeout(() => setState(""), 1800);
    } catch (error) {
      console.error("Unable to copy URL", error);
      setState("");
      alert("Copy failed. Copy the URL displayed next to the button.");
    }
  }

  return (
    <article className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Signature</p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{signature.label}</h2>
          {signature.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300">{signature.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {hasEmailPlaceholder && (
            <div className="flex items-center gap-2">
              <label htmlFor={`email-${signature.id}`} className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Your Email:
              </label>
              <input
                id={`email-${signature.id}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <CopyButton label="Copy HTML" onCopy={handleCopyHtml} active={state === "html"} />
            <CopyButton label="Copy raw URL" onCopy={handleCopyUrl} active={state === "url"} />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200">
        <div className="mb-2 font-medium">Raw HTML endpoint</div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <code className="break-all text-xs font-mono text-slate-800 dark:text-slate-100">{rawUrl}</code>
          <a
            className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline"
            href={rawUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open raw HTML
          </a>
        </div>
      </div>

      <div className="overflow-auto rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div dangerouslySetInnerHTML={{ __html: hasEmailPlaceholder && email ? signature.html.replace(/\{\{EMAIL\}\}/g, email) : signature.html }} />
      </div>
    </article>
  );
}

export default function SignatureGallery({ signatures, siteBase }: { signatures: SignatureDefinition[]; siteBase: string }) {
  return (
    <div className="space-y-6">
      {signatures.map((signature) => (
        <SignatureCard key={signature.id} signature={signature} siteBase={siteBase} />
      ))}
    </div>
  );
}
