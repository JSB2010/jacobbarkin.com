# Jacob Barkin Credit Embed

A lightweight embeddable "Designed by Jacob Barkin" credit component for websites.
Works everywhere: React, Vue, Angular, vanilla HTML, WordPress, Webflow, Squarespace, etc.

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

### Option 4: Vue
```vue
<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://jacobbarkin.com/embed/credit.js';
  document.head.appendChild(script);
});
</script>

<template>
  <jb-credit></jb-credit>
</template>
```

---

## Configuration Options

All options are optional. Set via `data-*` attributes on the `<jb-credit>` element:

| Attribute        | Values                                                    | Default   | Description                                      |
|------------------|-----------------------------------------------------------|-----------|--------------------------------------------------|
| `data-variant`   | `chip`, `prominent`, `badge`, `logo`, `minimal`, `text`   | `chip`    | Visual style variant                             |
| `data-size`      | `small`, `default`, `large`                               | `default` | Component size                                   |
| `data-align`     | `left`, `center`, `right`                                 | `center`  | Horizontal alignment within container            |
| `data-theme`     | `auto`, `light`, `dark`                                   | `auto`    | Color theme (auto detects from page)             |
| `data-position`  | `inline`, `fixed`                                         | `inline`  | inline = normal flow, fixed = sticky footer bar  |
| `data-no-track`  | (boolean)                                                 | false     | Disable analytics tracking for this embed        |

---

## Variants

### chip (default)
Full-featured chip with 16px logo icon, animated gradient border on hover, pulse ring effect, and mouse-follow glow.

### prominent ⭐ NEW
Larger inline layout with 28px logo - JSB initials clearly visible. Great for more visible credit placement.

### badge ⭐ NEW
Stacked vertical layout with large 40px logo at top, text below. Perfect for sidebars or prominent footer placement.

### logo ⭐ NEW
Just the logo (36px) with no text - minimalist and elegant. The logo links to jacobbarkin.com on click.

### minimal
Text only by default. On hover, a chip background appears. Good for footers or subtle placement.

### text
Ultra low-profile. Just the text "Designed by Jacob Barkin" with a gradient on the name. Subtle underline appears on hover. No chip, no background.

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

Default (chip variant, centered):
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
<script src="https://jacobbarkin.com/embed/credit.js" data-auto data-variant="minimal" data-size="small"></script>
```

---

## Features

- **Shadow DOM isolated** — Styles never conflict with your site's CSS
- **Auto theme detection** — Detects light/dark mode from your page automatically
- **Responsive** — Adapts to all screen sizes
- **Lightweight** — Under 5KB, no dependencies
- **Accessible** — WCAG compliant, proper ARIA attributes
- **Reduced motion** — Respects `prefers-reduced-motion` setting
- **Centrally updated** — Updates automatically when the component is improved

---

## Demo

https://jacobbarkin.com/embed/demo.html

