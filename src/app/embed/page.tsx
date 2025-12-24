"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Code, Palette, Layout, Sparkles } from "lucide-react";

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
<jb-credit data-variant="standard"></jb-credit>`,
    custom: `<!-- Customized with all options -->
<script src="https://jacobbarkin.com/embed/credit.js"><\/script>
<jb-credit 
  data-theme="auto" 
  data-variant="prominent" 
  data-align="center">
</jb-credit>`,
  };

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

      {/* Live Demo */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Live Preview
        </h2>
        <div className="grid gap-6">
          <div className="border rounded-lg p-4 bg-background">
            <p className="text-sm text-muted-foreground mb-2">Minimal (default)</p>
            {typeof window !== 'undefined' && (
              <jb-credit data-variant="minimal"></jb-credit>
            )}
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <p className="text-sm text-muted-foreground mb-2">Standard</p>
            {typeof window !== 'undefined' && (
              <jb-credit data-variant="standard"></jb-credit>
            )}
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <p className="text-sm text-muted-foreground mb-2">Prominent</p>
            {typeof window !== 'undefined' && (
              <jb-credit data-variant="prominent"></jb-credit>
            )}
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
          Configuration Options
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Attribute</th>
                <th className="text-left py-2 pr-4">Values</th>
                <th className="text-left py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="bg-muted px-1.5 py-0.5 rounded">data-theme</code></td>
                <td className="py-2 pr-4"><code>auto</code>, <code>light</code>, <code>dark</code></td>
                <td className="py-2 text-muted-foreground">Theme mode (default: auto-detect)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="bg-muted px-1.5 py-0.5 rounded">data-variant</code></td>
                <td className="py-2 pr-4"><code>minimal</code>, <code>standard</code>, <code>prominent</code></td>
                <td className="py-2 text-muted-foreground">Style variant (default: minimal)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="bg-muted px-1.5 py-0.5 rounded">data-align</code></td>
                <td className="py-2 pr-4"><code>center</code>, <code>left</code>, <code>right</code></td>
                <td className="py-2 text-muted-foreground">Text alignment (default: center)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code className="bg-muted px-1.5 py-0.5 rounded">data-position</code></td>
                <td className="py-2 pr-4"><code>inline</code>, <code>fixed</code></td>
                <td className="py-2 text-muted-foreground">Position mode (default: inline)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Features */}
      <Card className="p-6">
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
    </div>
  );
}

// TypeScript declaration for the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'jb-credit': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'data-theme'?: 'auto' | 'light' | 'dark';
        'data-variant'?: 'minimal' | 'standard' | 'prominent';
        'data-align'?: 'center' | 'left' | 'right';
        'data-position'?: 'inline' | 'fixed';
      }, HTMLElement>;
    }
  }
}

