# Jacob Barkin Credit Embed

A lightweight embeddable "Designed by Jacob Barkin" credit component for websites.
Works everywhere: React, Angular, vanilla HTML, WordPress, Webflow, Squarespace, etc.

---

## Implementation

### Option 1: Manual Placement
Add the script once, then place the element where you want the credit to appear:

```html
<script src="https://jacobbarkin.com/embed/credit.js"></script>
<jb-credit></jb-credit>
```

### Option 2: Auto-Inject
Automatically inserts the credit at the bottom of the page:

```html
<script src="https://jacobbarkin.com/embed/credit.js" data-auto></script>
```

### Option 3: React / Next.js
```jsx
import { useEffect } from 'react';

useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://jacobbarkin.com/embed/credit.js';
  document.head.appendChild(script);
}, []);

// In your JSX:
<jb-credit></jb-credit>
```

### TypeScript (React / Next.js)
If your project uses TypeScript, add a JSX intrinsic element declaration so `<jb-credit>` is allowed:

```ts
// e.g. src/types/custom-elements.d.ts
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'jb-credit': React.HTMLAttributes<HTMLElement> & {
        'data-variant'?: 'prominent' | 'chip' | 'badge' | 'logo' | 'minimal' | 'text' | 'data-only';
        'data-theme'?: 'light' | 'dark' | 'auto';
        'data-position'?: 'inline' | 'fixed';
        'data-size'?: 'small' | 'default' | 'large';
        'data-align'?: 'left' | 'right' | 'center';
        'data-no-track'?: string | boolean;
        'data-no-rules'?: string | boolean;
        'data-site'?: string;
        'data-page-group'?: string;
        'data-experiment'?: string;
        'data-debug'?: string | boolean;
      };
    }
  }
}
```

Make sure this `.d.ts` file is included by your `tsconfig.json` (e.g., in a `src/` layout, put it under `src/types/`). If your project uses `typeRoots` or `types`, add the folder there so TypeScript can see the declaration.

**Troubleshooting (TypeScript)**
- Build still fails: the `.d.ts` file is not being picked up. Move it into `src/` or add its folder to `tsconfig.json` `include`.
- If `typeRoots` or `types` are set, add your types folder there (otherwise TypeScript ignores it).
- Restart the dev server or rerun `next build` after adding the `.d.ts`.
- Don't place the file in `app/` unless your `tsconfig.json` includes it.

---

## Implementation Notes (for AI agents)

- Add the script tag once per page. You can render multiple `<jb-credit>` elements after the script is loaded.
- `data-auto` injects the element automatically; if you use `data-auto`, do not also add `<jb-credit>`.
- For React/Next.js, only inject the script on the client (e.g., `useEffect`) to avoid SSR issues.
- If the site uses a strict Content Security Policy, allow `https://jacobbarkin.com` in `script-src` and `connect-src` or set `data-no-track` to disable analytics/heartbeat.
- `data-no-track` disables both analytics and heartbeat pings.
- `data-no-rules` disables remote rule/custom-content evaluation while keeping analytics and heartbeat enabled.
- The script targets Safari 12+ and current evergreen Chrome, Firefox, and Edge.

---

## Configuration Options

All options are optional. Set via `data-*` attributes on the `<jb-credit>` element:

| Attribute        | Values                                                           | Default   | Description                                      |
|------------------|------------------------------------------------------------------|-----------|--------------------------------------------------|
| `data-variant`   | `prominent`, `chip`, `badge`, `logo`, `minimal`, `text`, `data-only` | `prominent` | Visual style variant                           |
| `data-size`      | `small`, `default`, `large`                                      | `default` | Component size                                   |
| `data-align`     | `left`, `center`, `right`                                        | `center`  | Horizontal alignment within container            |
| `data-theme`     | `auto`, `light`, `dark`                                          | `auto`    | Color theme (auto detects from page)             |
| `data-position`  | `inline`, `fixed`                                                | `inline`  | inline = normal flow, fixed = sticky footer bar  |
| `data-no-track`  | (boolean)                                                        | false     | Disable analytics tracking for this embed        |
| `data-no-rules`  | (boolean)                                                        | false     | Disable remote rules/replacements for this embed |
| `data-site`      | string                                                           | host-based fallback | Stable installation identifier         |
| `data-page-group`| string                                                           | none      | Logical page grouping for reporting              |
| `data-experiment`| string                                                           | none      | Experiment identifier for analytics              |
| `data-debug`     | (boolean)                                                        | false     | Log rule evaluation + runtime diagnostics        |

Note: When using `data-auto`, you can set these `data-*` attributes (including `data-no-track`) on the `<script>` tag and they will be applied to the injected `<jb-credit>`.

---

## Analytics

By default, the embed tracks **impressions** (when visible) and **clicks**. It also captures limited metadata to make the dashboard more useful:

- Page URL + title, referrer, and UTM parameters
- Embed configuration (variant, size, theme, position, alignment, version, auto vs manual)
- Device context (viewport size, device type), language, and timezone offset
- Session-aware telemetry (`session_id`, `page_view_id`) for better unique session reporting
- Rule evaluation / replacement telemetry (`replacement_applied`, `replacement_skipped`, `error`)
- Heartbeat pings (about once per hour while the page is open/visible) to track active sites

Disable analytics per-embed with `data-no-track`.

### Remote Rules

By default, the script checks `/api/embed-rules/evaluate` for remote rules. Matched rules can:

- show a sandboxed banner (`banner`)
- redirect the page (`redirect`)
- override credit styling (`credit_variant_override`)
- replace the full document (`page_takeover`)
- replace the embed itself (`inline_replace`)

If rule evaluation fails, the script falls back to the legacy `/api/embed-custom-content` check. Add `data-no-rules` to skip both rule systems without disabling analytics.

### Event Payload Fields

Telemetry events are batched and sent as JSON arrays to `/api/embed-analytics` or `/api/embed-heartbeat`.
Payloads include page URL/host/path/title, referrer and UTM fields, embed configuration, `site_key`,
`installation_id`, `page_group`, `experiment_id`, `session_id`, `page_view_id`, viewport/device/language/timezone
metadata, and rule metadata (`rule_id`, `template_id`, `action_type`, `error_code`) when present.

---

## Variants

### prominent (default)
Larger inline layout with 28px logo - JSB initials clearly visible. Great for more visible credit placement.

### chip
Full-featured chip with 16px logo icon, animated gradient border on hover, pulse ring effect, and mouse-follow glow.

### badge
Stacked vertical layout with large 40px logo at top, text below. Perfect for sidebars or prominent footer placement.

### logo
Just the logo (36px) with no text - minimalist and elegant. The logo links to jacobbarkin.com on click.

### minimal
Text only by default. On hover, a chip background appears. Good for footers or subtle placement.

### text
Ultra low-profile. Just the text "Designed by Jacob Barkin" with a gradient on the name. Subtle underline appears on hover. No chip, no background.

### data-only
Completely invisible - no UI whatsoever. Only sends heartbeat pings to track active sites. Does NOT track impressions or clicks. Perfect for tracking site activity without visible credit.

---

## Size Options

- **small** — Smaller text and padding, compact appearance
- **default** — Standard size
- **large** — Larger text and padding

---

## Position Options

- **inline** — Component sits in normal document flow where you place it
- **fixed** — Creates a sticky footer bar at the bottom of the viewport with backdrop blur

---

## Examples

Default (prominent variant, centered):
```html
<jb-credit></jb-credit>
```

Minimal variant, small size, left-aligned:
```html
<jb-credit data-variant="minimal" data-size="small" data-align="left"></jb-credit>
```

Text-only variant:
```html
<jb-credit data-variant="text"></jb-credit>
```

Large chip, right-aligned:
```html
<jb-credit data-size="large" data-align="right"></jb-credit>
```

Fixed footer bar:
```html
<jb-credit data-position="fixed"></jb-credit>
```

Force dark theme:
```html
<jb-credit data-theme="dark"></jb-credit>
```

Auto-inject with options:
```html
<script src="https://jacobbarkin.com/embed/credit.js" data-auto data-variant="minimal" data-size="small" data-site="client-marketing-site" data-page-group="landing" data-experiment="spring-cta-a"></script>
```

Auto-inject without remote rules:
```html
<script src="https://jacobbarkin.com/embed/credit.js" data-auto data-no-rules></script>
```

Data-only variant (invisible, heartbeats only):
```html
<jb-credit data-variant="data-only"></jb-credit>
```

---

## Features

- **Shadow DOM isolated** — Styles never conflict with your site's CSS
- **Auto theme detection** — Detects light/dark mode from your page automatically
- **Responsive** — Adapts to all screen sizes
- **Lightweight** — Minimal footprint, no dependencies
- **Accessible** — WCAG compliant, proper ARIA attributes
- **Reduced motion** — Respects `prefers-reduced-motion` setting
- **Centrally updated** — Updates automatically when the component is improved

---

## Demo

https://jacobbarkin.com/embed
