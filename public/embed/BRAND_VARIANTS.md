# Brand-Focused Embed Variants

## Quick Reference Guide

### New Variants (v2.2.0)

All variants support the existing features:
- Size: `data-size="small|default|large"`
- Alignment: `data-align="left|center|right"`
- Theme: `data-theme="auto|light|dark"`
- Position: `data-position="inline|fixed"`

---

### 1. Logo Prominent
**Emphasis**: Brand identity through larger logo

```html
<jb-credit data-variant="logo-prominent"></jb-credit>
```

**Features**:
- Larger logo (28-36px vs standard 16-20px)
- Smaller text for balance
- Full hover effects (gradient border, pulse, glow)

**Best for**: Portfolio sites, design agencies, personal brands

---

### 2. Initials Badge
**Emphasis**: Modern, memorable branding with "JB" initials

```html
<jb-credit data-variant="initials-badge"></jb-credit>
```

**Features**:
- Gradient-filled badge with "JB" text
- Rounded corners (8px border-radius)
- Rotates 5° on hover

**Best for**: Modern web apps, SaaS products, tech startups

---

### 3. Company Name
**Emphasis**: Company branding over personal branding

```html
<jb-credit data-variant="company-name"></jb-credit>
```

**Features**:
- Displays "Ask The Kidz" instead of "Jacob Barkin"
- Company name in green-to-blue gradient
- Standard logo size

**Best for**: Agency work, team projects, corporate sites

---

### 4. Gradient Logo
**Emphasis**: Eye-catching, vibrant visual impact

```html
<jb-credit data-variant="gradient-logo"></jb-credit>
```

**Features**:
- Logo wrapped in circular gradient border
- Blue → Green → Cyan gradient flow
- Scales 1.1x on hover

**Best for**: Creative portfolios, artistic sites, bold designs

---

### 5. Icon + Initials
**Emphasis**: Dual branding approach

```html
<jb-credit data-variant="icon-initials"></jb-credit>
```

**Features**:
- Logo + large "JB" gradient text + full name
- Combines visual and text branding
- Three-part layout

**Best for**: Professional sites, balanced branding needs

---

### 6. Stacked
**Emphasis**: Compact, space-efficient vertical layout

```html
<jb-credit data-variant="stacked"></jb-credit>
```

**Features**:
- Logo on top, text centered below
- Vertical flex layout
- Larger logo for visibility

**Best for**: Sidebars, narrow columns, mobile-first designs

---

### 7. Logo Only
**Emphasis**: Ultra-minimal footprint

```html
<jb-credit data-variant="logo-only"></jb-credit>
```

**Features**:
- Just the logo (20-36px)
- Title attribute shows full info on hover
- Minimal padding

**Best for**: Dense layouts, minimal designs, icon-based interfaces

---

### 8. Brand Bar
**Emphasis**: Premium, full-width branded bar

```html
<jb-credit data-variant="brand-bar"></jb-credit>
```

**Features**:
- Wide layout (max 400px)
- Gradient background with blur effect
- Vertical divider between logo and text
- Rounded corners (12px)

**Best for**: Footer bars, premium designs, feature-rich sites

---

## Size Recommendations

### Small (`data-size="small"`)
- Logo: 12-20px
- Font: 0.625-0.6875rem
- Padding: 0.25-0.5rem
- **Use**: Tight spaces, mobile, minimal footprint

### Default (`data-size="default"`)
- Logo: 16-28px
- Font: 0.6875-0.75rem
- Padding: 0.4-0.625rem
- **Use**: Most common, balanced sizing

### Large (`data-size="large"`)
- Logo: 20-36px
- Font: 0.75-0.875rem
- Padding: 0.5-0.75rem
- **Use**: Hero sections, prominent placement

---

## Combination Examples

### Minimal Footer
```html
<jb-credit 
  data-variant="initials-badge" 
  data-size="small" 
  data-align="left">
</jb-credit>
```

### Prominent Hero
```html
<jb-credit 
  data-variant="logo-prominent" 
  data-size="large" 
  data-align="center">
</jb-credit>
```

### Company Footer Bar
```html
<jb-credit 
  data-variant="brand-bar" 
  data-size="default" 
  data-position="fixed">
</jb-credit>
```

### Modern App Sidebar
```html
<jb-credit 
  data-variant="stacked" 
  data-size="small" 
  data-align="center">
</jb-credit>
```

---

## Design Philosophy

All brand variants follow these principles:

1. **Gradient Usage**: Blue (#3b82f6) → Green (#10b981) → Cyan (#06b6d4)
2. **Hover Effects**: Subtle transforms, glows, and animations
3. **Theme Aware**: Automatic light/dark mode detection
4. **Accessibility**: WCAG compliant, reduced motion support
5. **Performance**: Lightweight, no dependencies, Shadow DOM isolated

---

## Version History

- **v2.2.0** - Added 8 brand-focused variants
- **v2.1.0** - Original chip, minimal, text variants
