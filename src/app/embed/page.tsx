"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Code, Palette, Layout, Sparkles, FileText } from "lucide-react";

export default function EmbedPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load the embed script for demo
    const script = document.createElement('script');
    script.src = '/embed/credit.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeExamples = {
    basic: `<!-- Add to your HTML -->
<script src="https://jacobbarkin.com/embed/credit.js"><\/script>
<jb-credit></jb-credit>`,
    auto: `<!-- Auto-inject at bottom of page -->
<script src="https://jacobbarkin.com/embed/credit.js" data-auto><\/script>`,
    react: `// React/Next.js usage
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://jacobbarkin.com/embed/credit.js';
  document.head.appendChild(script);
}, []);

// In your JSX:
<jb-credit></jb-credit>`,
    custom: `<!-- Example with all options -->
<script src="https://jacobbarkin.com/embed/credit.js"><\/script>
<jb-credit
  data-variant="minimal"
  data-size="small"
  data-align="left"
  data-theme="dark">
</jb-credit>`,
  };

  const instructionsText = `# Jacob Barkin Credit Embed

A lightweight embeddable "Designed by Jacob Barkin" credit component.
Works everywhere: React, Vue, Angular, vanilla HTML, WordPress, Webflow, etc.

---

## Implementation

### Option 1: Manual Placement
\`\`\`html
<script src="https://jacobbarkin.com/embed/credit.js"><\/script>
<jb-credit></jb-credit>
\`\`\`

### Option 2: Auto-Inject
Automatically inserts at the bottom of the page:
\`\`\`html
<script src="https://jacobbarkin.com/embed/credit.js" data-auto><\/script>
\`\`\`

### Option 3: React / Next.js
\`\`\`jsx
import { useEffect } from 'react';

useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://jacobbarkin.com/embed/credit.js';
  document.head.appendChild(script);
}, []);

// In your JSX:
<jb-credit></jb-credit>
\`\`\`

### Option 4: Vue
\`\`\`vue
<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://jacobbarkin.com/embed/credit.js';
  document.head.appendChild(script);
});
<\/script>

<template>
  <jb-credit></jb-credit>
</template>
\`\`\`

---

## Configuration Options

All options are optional. Set via data-* attributes:

| Attribute        | Values                      | Default   | Description                                     |
|------------------|-----------------------------|-----------|-------------------------------------------------|
| \`data-variant\`   | \`chip\`, \`minimal\`, \`text\`   | \`chip\`    | Visual style variant                            |
| \`data-size\`      | \`small\`, \`default\`, \`large\` | \`default\` | Component size                                  |
| \`data-align\`     | \`left\`, \`center\`, \`right\`   | \`center\`  | Horizontal alignment within container           |
| \`data-theme\`     | \`auto\`, \`light\`, \`dark\`     | \`auto\`    | Color theme (auto detects from page)            |
| \`data-position\`  | \`inline\`, \`fixed\`           | \`inline\`  | inline = normal flow, fixed = sticky footer bar |
| \`data-no-track\`  | (boolean)                   | false     | Disable analytics tracking                      |

---

## Variants

**chip** — Full-featured with logo icon, animated gradient border, pulse ring, mouse-follow glow
**minimal** — Text only by default, chip background appears on hover
**text** — Ultra low-profile, just text with gradient name, subtle underline on hover

---

## Examples

Default:
\`\`\`html
<jb-credit></jb-credit>
\`\`\`

Minimal, small, left-aligned:
\`\`\`html
<jb-credit data-variant="minimal" data-size="small" data-align="left"></jb-credit>
\`\`\`

Text-only:
\`\`\`html
<jb-credit data-variant="text"></jb-credit>
\`\`\`

Large, right-aligned:
\`\`\`html
<jb-credit data-size="large" data-align="right"></jb-credit>
\`\`\`

Fixed footer bar:
\`\`\`html
<jb-credit data-position="fixed"></jb-credit>
\`\`\`

Force dark theme:
\`\`\`html
<jb-credit data-theme="dark"></jb-credit>
\`\`\`

---

## Features

- Shadow DOM isolated (never conflicts with your CSS)
- Auto theme detection (light/dark)
- Responsive design
- Under 5KB, no dependencies
- WCAG accessible
- Respects prefers-reduced-motion

---

Demo: https://jacobbarkin.com/embed/demo.html`;

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Embeddable Credit Component
        </div>
        <h1 className="text-4xl font-bold mb-4">Designer Credit Embed</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Add a consistent &quot;Designed by Jacob Barkin&quot; credit to any website with just one line of code.
          Works with React, Vue, vanilla HTML, WordPress, Webflow - anything.
        </p>
      </div>

      {/* Live Demo - Variants */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Style Variants
          <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">Hover me!</span>
        </h2>
        <div className="grid gap-4">
          <div className="border rounded-lg p-4 bg-gradient-to-br from-background to-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-medium text-foreground">💎 Chip</p>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">Default</span>
            </div>
            {typeof window !== 'undefined' && <jb-credit data-variant="chip"></jb-credit>}
            <p className="text-xs text-muted-foreground mt-2">Full-featured: Logo, animated gradient border, pulse ring, mouse-follow glow</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <p className="text-sm font-medium text-foreground mb-2">✨ Minimal</p>
            {typeof window !== 'undefined' && <jb-credit data-variant="minimal"></jb-credit>}
            <p className="text-xs text-muted-foreground mt-2">Text only, chip appears on hover - good for footers</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <p className="text-sm font-medium text-foreground mb-2">📝 Text</p>
            {typeof window !== 'undefined' && <jb-credit data-variant="text"></jb-credit>}
            <p className="text-xs text-muted-foreground mt-2">Ultra low-profile - just text with gradient name, subtle underline on hover</p>
          </div>
        </div>
      </Card>

      {/* Sizes */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📐 Sizes</h2>
        <div className="grid gap-4">
          <div className="border rounded-lg p-4 bg-background">
            <p className="text-sm text-muted-foreground mb-2">Small</p>
            {typeof window !== 'undefined' && <jb-credit data-variant="chip" data-size="small"></jb-credit>}
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <p className="text-sm text-muted-foreground mb-2">Default</p>
            {typeof window !== 'undefined' && <jb-credit data-variant="chip" data-size="default"></jb-credit>}
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <p className="text-sm text-muted-foreground mb-2">Large</p>
            {typeof window !== 'undefined' && <jb-credit data-variant="chip" data-size="large"></jb-credit>}
          </div>
        </div>
      </Card>

      {/* Quick Start */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          Quick Start
        </h2>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="auto">Auto-Inject</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          {Object.entries(codeExamples).map(([key, code]) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{code}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(code, key)}
                >
                  {copied === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Options Reference */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layout className="w-5 h-5 text-primary" />
          All Options
        </h2>
        <div className="grid gap-4">
          <div className="border rounded-lg p-4">
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-variant</code>
            <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">chip</strong> (default) | minimal | text</p>
          </div>
          <div className="border rounded-lg p-4">
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-size</code>
            <p className="text-sm text-muted-foreground mt-1">small | <strong className="text-foreground">default</strong> | large</p>
          </div>
          <div className="border rounded-lg p-4">
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-align</code>
            <p className="text-sm text-muted-foreground mt-1">left | <strong className="text-foreground">center</strong> | right</p>
          </div>
          <div className="border rounded-lg p-4">
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-theme</code>
            <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">auto</strong> (detects from page) | light | dark</p>
          </div>
          <div className="border rounded-lg p-4">
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">data-position</code>
            <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">inline</strong> | fixed (sticky footer bar)</p>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="grid gap-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <span><strong className="text-foreground">Universal compatibility</strong> - Works with any website (React, Vue, Angular, vanilla HTML, WordPress, Webflow, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <span><strong className="text-foreground">Shadow DOM isolation</strong> - Styles never conflict with your site&apos;s CSS</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <span><strong className="text-foreground">Auto theme detection</strong> - Adapts to light/dark mode automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <span><strong className="text-foreground">Responsive</strong> - Looks great on all screen sizes</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <span><strong className="text-foreground">Lightweight</strong> - Under 5KB, no dependencies</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <span><strong className="text-foreground">Centrally updateable</strong> - Update once, all sites update</span>
          </li>
        </ul>
      </Card>

      {/* Instructions for AI */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Instructions for AI Agents
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Copy this and paste it into your AI assistant when developing a site:
        </p>
        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs max-h-80 overflow-y-auto">
            <code>{instructionsText}</code>
          </pre>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(instructionsText, 'instructions')}
          >
            {copied === 'instructions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="ml-1">{copied === 'instructions' ? 'Copied!' : 'Copy All'}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

// TypeScript declaration for the custom jb-credit element
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'jb-credit': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'data-variant'?: 'chip' | 'minimal' | 'text';
        'data-size'?: 'small' | 'default' | 'large';
        'data-align'?: 'center' | 'left' | 'right';
        'data-theme'?: 'auto' | 'light' | 'dark';
        'data-position'?: 'inline' | 'fixed';
      }, HTMLElement>;
    }
  }
}

