# Jacob Barkin Credit Embed - Integration Guide

Add a consistent "Designed by Jacob Barkin" credit to any website with just one line of code.

## Quick Start

### Option 1: Basic (Recommended)

Add the script and place the element where you want the credit:

```html
<script src="https://jacobbarkin.com/embed/credit.js"></script>
<jb-credit></jb-credit>
```

### Option 2: Auto-Inject

Automatically insert at the bottom of the page:

```html
<script src="https://jacobbarkin.com/embed/credit.js" data-auto></script>
```

## Framework-Specific Examples

### React / Next.js

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://jacobbarkin.com/embed/credit.js';
    document.head.appendChild(script);
  }, []);

  return (
    <div>
      {/* Your content */}
      <jb-credit data-variant="standard"></jb-credit>
    </div>
  );
}
```

### Vue.js

```vue
<template>
  <div>
    <!-- Your content -->
    <jb-credit data-variant="standard"></jb-credit>
  </div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://jacobbarkin.com/embed/credit.js';
    document.head.appendChild(script);
  }
}
</script>
```

### WordPress

Add to your theme's `footer.php` before `</body>`:

```php
<script src="https://jacobbarkin.com/embed/credit.js"></script>
<jb-credit data-variant="minimal"></jb-credit>
```

### Webflow / Squarespace / Wix

Use the "Custom Code" or "Embed" feature to add:

```html
<script src="https://jacobbarkin.com/embed/credit.js"></script>
<jb-credit></jb-credit>
```

## Configuration Options

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-theme` | `auto`, `light`, `dark` | `auto` | Color theme (auto-detects from site) |
| `data-variant` | `minimal`, `standard`, `prominent` | `minimal` | Style variant |
| `data-align` | `center`, `left`, `right` | `center` | Text alignment |
| `data-position` | `inline`, `fixed` | `inline` | Position mode |

### Style Variants

- **minimal** - Small, subtle text with hover effect
- **standard** - Slightly larger, good for most footers
- **prominent** - Includes top border, best for standalone footers

### Examples

```html
<!-- Minimal, centered (default) -->
<jb-credit></jb-credit>

<!-- Standard, left-aligned -->
<jb-credit data-variant="standard" data-align="left"></jb-credit>

<!-- Prominent with dark theme -->
<jb-credit data-variant="prominent" data-theme="dark"></jb-credit>

<!-- Fixed to bottom of viewport -->
<jb-credit data-position="fixed" data-variant="minimal"></jb-credit>
```

## Features

- **Universal compatibility** - Works with React, Vue, Angular, vanilla HTML, WordPress, Webflow, etc.
- **Shadow DOM isolation** - Styles never conflict with your site's CSS
- **Auto theme detection** - Adapts to light/dark mode automatically
- **Responsive** - Looks great on all screen sizes
- **Lightweight** - Under 5KB, no dependencies
- **Centrally updateable** - Update once on jacobbarkin.com, all sites update

## Demo

View live demos at:
- https://jacobbarkin.com/embed (Next.js page)
- https://jacobbarkin.com/embed/demo.html (Standalone HTML)

## TypeScript Support

If using TypeScript with React/Next.js, add this declaration:

```typescript
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
```

## Troubleshooting

### Credit not appearing
- Ensure the script is loaded before the `<jb-credit>` element
- Check browser console for errors

### Wrong colors
- The component auto-detects theme. Use `data-theme="light"` or `data-theme="dark"` to force a specific theme

### Conflicting styles
- The component uses Shadow DOM, so external styles shouldn't affect it. If you're seeing issues, please report them.

## Support

For issues or questions, contact via https://jacobbarkin.com/contact

