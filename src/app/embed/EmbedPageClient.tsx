"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  Code,
  Palette,
  Layout,
  Sparkles,
  FileText,
  Sun,
  Moon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PreviewTheme = "auto" | "light" | "dark";
type VariantId = "prominent" | "chip" | "badge" | "logo" | "minimal" | "text";

type EmbedPageClientProps = {
  instructionsText: string;
};

const codeExamples = {
  basic: `<!-- Add once to your HTML -->\n<script src="https://jacobbarkin.com/embed/credit.js"><\/script>\n<jb-credit></jb-credit>`,
  auto: `<!-- Auto-inject at bottom of the page -->\n<script src="https://jacobbarkin.com/embed/credit.js" data-auto><\/script>`,
  react: `// React / Next.js\nimport { useEffect } from 'react';\n\nuseEffect(() => {\n  const script = document.createElement('script');\n  script.src = 'https://jacobbarkin.com/embed/credit.js';\n  document.head.appendChild(script);\n}, []);\n\n// In your JSX:\n<jb-credit></jb-credit>`,
  vue: `// Vue\nimport { onMounted } from 'vue';\n\nonMounted(() => {\n  const script = document.createElement('script');\n  script.src = 'https://jacobbarkin.com/embed/credit.js';\n  document.head.appendChild(script);\n});\n\n// In your template:\n<jb-credit></jb-credit>`,
  custom: `<!-- Custom example -->\n<script src="https://jacobbarkin.com/embed/credit.js"><\/script>\n<jb-credit\n  data-variant="badge"\n  data-size="large"\n  data-align="left"\n  data-theme="dark"\n  data-site="client-marketing-site"\n  data-page-group="footer"\n  data-experiment="credit-v3-a">\n</jb-credit>`,
  fixed: `<!-- Fixed footer with offset -->\n<script src="https://jacobbarkin.com/embed/credit.js"><\/script>\n<jb-credit data-position="fixed" data-bottom-offset="16px"></jb-credit>`,
};

const variantDemos: { id: VariantId; label: string; description: string; badge?: string }[] = [
  {
    id: "prominent",
    label: "Prominent",
    description: "Default. Larger inline logo with extra presence.",
    badge: "Default",
  },
  {
    id: "chip",
    label: "Chip",
    description: "Full-featured with glow, animated border, and pulse.",
  },
  {
    id: "badge",
    label: "Badge",
    description: "Stacked layout with a large logo for sidebars.",
  },
  {
    id: "logo",
    label: "Logo Only",
    description: "Just the logo for a minimalist mark.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Text-only until hover, great for subtle footers.",
  },
  {
    id: "text",
    label: "Text",
    description: "Ultra low-profile text link with gradient name.",
  },
];

const themeOptions: { value: PreviewTheme; label: string; icon: LucideIcon }[] = [
  { value: "auto", label: "Auto", icon: Sparkles },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function EmbedPageClient({ instructionsText }: EmbedPageClientProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("auto");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/embed/credit.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const previewThemeAttr = previewTheme === "auto" ? undefined : previewTheme;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Embeddable Credit Component
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Designer Credit Embed</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Add a consistent &quot;Designed by Jacob Barkin&quot; credit to any website with just one line of code.
          Works with React, Vue, vanilla HTML, WordPress, Webflow - anything.
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold">Style Variants</h2>
              <span className="sm:ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                Hover me!
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={previewTheme === option.value ? "default" : "outline"}
                  className={cn(
                    "gap-1.5 flex-1 sm:flex-none",
                    previewTheme === option.value && "shadow-sm"
                  )}
                  onClick={() => setPreviewTheme(option.value)}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {variantDemos.map((variant) => (
              <div
                key={variant.id}
                className="border rounded-lg p-4 sm:p-5 bg-gradient-to-br from-background to-muted/40"
              >
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-medium text-foreground">{variant.label}</p>
                  {variant.badge && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                      {variant.badge}
                    </span>
                  )}
                </div>
                <jb-credit data-variant={variant.id} data-theme={previewThemeAttr}></jb-credit>
                <p className="text-xs text-muted-foreground mt-2">{variant.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Sizes</h2>
            <div className="grid gap-4">
              <div className="border rounded-lg p-3 sm:p-4 bg-background">
                <p className="text-sm text-muted-foreground mb-2">Small</p>
                <jb-credit data-variant="chip" data-size="small" data-theme={previewThemeAttr}></jb-credit>
              </div>
              <div className="border rounded-lg p-3 sm:p-4 bg-background">
                <p className="text-sm text-muted-foreground mb-2">Default</p>
                <jb-credit data-variant="chip" data-size="default" data-theme={previewThemeAttr}></jb-credit>
              </div>
              <div className="border rounded-lg p-3 sm:p-4 bg-background">
                <p className="text-sm text-muted-foreground mb-2">Large</p>
                <jb-credit data-variant="chip" data-size="large" data-theme={previewThemeAttr}></jb-credit>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Key Options</h2>
            <div className="grid gap-3 sm:gap-4">
              <div className="border rounded-lg p-3 sm:p-4">
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-variant</code>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong className="text-foreground">prominent</strong> (default) | chip | badge | logo | minimal | text
                </p>
              </div>
              <div className="border rounded-lg p-3 sm:p-4">
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-size</code>
                <p className="text-sm text-muted-foreground mt-1">small | <strong className="text-foreground">default</strong> | large</p>
              </div>
              <div className="border rounded-lg p-3 sm:p-4">
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-align</code>
                <p className="text-sm text-muted-foreground mt-1">left | <strong className="text-foreground">center</strong> | right</p>
              </div>
              <div className="border rounded-lg p-3 sm:p-4">
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-theme</code>
                <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">auto</strong> | light | dark</p>
              </div>
              <div className="border rounded-lg p-3 sm:p-4">
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-position</code>
                <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">inline</strong> | fixed (sticky footer bar)</p>
              </div>
              <div className="border rounded-lg p-3 sm:p-4">
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-effects</code>
                <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">full</strong> | none</p>
              </div>
              <div className="border rounded-lg p-3 sm:p-4">
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-no-track</code>
                <p className="text-sm text-muted-foreground mt-1">
                  Disable analytics tracking for this embed. The embed also honors Global Privacy Control for telemetry.
                </p>
              </div>
              <div className="border rounded-lg p-3 sm:p-4">
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-site / data-page-group / data-experiment</code>
                <p className="text-sm text-muted-foreground mt-1">Optional install identity, grouped reporting, and experiment labels for the admin dashboard.</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Quick Start
          </h2>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="auto">Auto-Inject</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="vue">Vue</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            {Object.entries(codeExamples).map(([key, code]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="relative">
                  <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">
                    <code>{code}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code, key)}
                  >
                    {copied === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1">{copied === key ? "Copied!" : "Copy"}</span>
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            Features
          </h2>
          <ul className="grid gap-3 text-sm sm:text-base text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <span><strong className="text-foreground">Universal compatibility</strong> - Works with React, Vue, Angular, vanilla HTML, WordPress, Webflow, and more.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <span><strong className="text-foreground">Shadow DOM isolation</strong> - Styles never conflict with your site&apos;s CSS.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <span><strong className="text-foreground">Auto theme detection</strong> - Adapts to light/dark mode automatically.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <span><strong className="text-foreground">Responsive</strong> - Looks great at any size or layout.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <span><strong className="text-foreground">Lightweight</strong> - Tiny footprint, zero dependencies.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <span><strong className="text-foreground">Optional analytics</strong> - Track impressions and clicks, or disable with <code className="bg-muted px-1 rounded">data-no-track</code>.</span>
            </li>
          </ul>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Privacy and Tracking</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-7">
            The embed sends operational telemetry by default, including page URL, referrer, UTM parameters,
            viewport/device context, language, timezone offset, embed configuration, impressions, clicks,
            errors, and heartbeat events. Site owners can disable telemetry with{" "}
            <code className="bg-muted px-1 rounded">data-no-track</code>, and visitors using Global Privacy
            Control will not send embed analytics or heartbeat telemetry. See the{" "}
            <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Instructions for AI Agents
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Copy this and paste it into your AI assistant when developing a site:
          </p>
          <div className="relative">
            <pre className="bg-muted p-3 sm:p-4 rounded-lg text-[11px] sm:text-xs max-h-72 sm:max-h-96 overflow-y-auto whitespace-pre-wrap">
              <code>{instructionsText}</code>
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(instructionsText, "instructions")}
            >
              {copied === "instructions" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-1">{copied === "instructions" ? "Copied!" : "Copy All"}</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
