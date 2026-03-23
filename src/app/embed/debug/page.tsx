"use client";

import { useMemo, useState } from "react";
import { Bug, Copy, Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const defaultSnippet = `<script src="https://jacobbarkin.com/embed/credit.js" data-auto data-site="client-marketing-site" data-page-group="landing" data-debug></script>`;

export default function EmbedDebugPage() {
  const [snippet, setSnippet] = useState(defaultSnippet);
  const [pageUrl, setPageUrl] = useState("https://example.com/landing?utm_campaign=spring");

  const diagnostics = useMemo(() => {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!snippet.includes("credit.js")) {
      issues.push("Missing `credit.js` script reference.");
    }
    if ((snippet.match(/credit\.js/g) || []).length > 1) {
      issues.push("Multiple embed script references detected. Use one script tag per page.");
    }
    if (snippet.includes("data-auto") && snippet.includes("<jb-credit")) {
      issues.push("`data-auto` plus a manual `<jb-credit>` element can double-render the credit.");
    }
    if (!snippet.includes("data-site")) {
      recommendations.push("Add `data-site` for stable installation identity and cleaner site grouping.");
    }
    if (!snippet.includes("data-page-group")) {
      recommendations.push("Add `data-page-group` to group landing pages, docs, or footers together.");
    }
    if (!snippet.includes("data-debug")) {
      recommendations.push("Add `data-debug` while integrating to inspect rule evaluation and runtime behavior.");
    }
    recommendations.push("If your site uses strict CSP, allow `https://jacobbarkin.com` in `script-src` and `connect-src`.");
    recommendations.push("If you only want visibility without UI, use `data-variant=\"data-only\"`.");

    return { issues, recommendations };
  }, [snippet]);

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Embed Debug</h1>
        <p className="text-muted-foreground mt-2">
          Inspect your install snippet, catch common misconfigurations, and verify the reporting metadata you plan to send.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Install Snippet
            </CardTitle>
            <CardDescription>Paste the exact embed snippet you plan to use.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={snippet} onChange={(event) => setSnippet(event.target.value)} className="min-h-[220px] font-mono text-xs" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(snippet)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Context
            </CardTitle>
            <CardDescription>Use the same page URL shape you expect in production.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={pageUrl} onChange={(event) => setPageUrl(event.target.value)} />
            <div className="rounded-xl border p-4 text-sm">
              <div className="font-medium">Simulated page</div>
              <div className="text-muted-foreground break-all mt-1">{pageUrl}</div>
            </div>
            <div className="rounded-xl border p-4 text-sm">
              <div className="font-medium">Expected telemetry extras</div>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>`session_id` and `page_view_id` generated automatically</li>
                <li>`data-site`, `data-page-group`, and `data-experiment` passed through if present</li>
                <li>rule evaluation and replacement events tracked unless `data-no-track` is set</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Checks
          </CardTitle>
          <CardDescription>Static checks for the most common embed mistakes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="font-medium mb-3">Detected issues</div>
            {diagnostics.issues.length === 0 ? (
              <p className="text-sm text-emerald-600">No obvious snippet issues detected.</p>
            ) : (
              <ul className="space-y-2 text-sm text-rose-600">
                {diagnostics.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium mb-3">Recommendations</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {diagnostics.recommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
