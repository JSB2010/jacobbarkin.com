# Performance Guide

This document outlines the performance strategy for the Jacob Barkin Portfolio. The site is designed for speed using a combination of Next.js best practices, edge rendering, and diligent asset optimization.

## Core Strategy

### 1. Edge Architectures
-   **Cloudflare Workers**: The application runs on the edge, minimizing Time to First Byte (TTFB).
-   **OpenNext**: Adapts Next.js to the Worker environment, ensuring efficient request handling.

### 2. Rendering & Caching
-   **Static Assets**: Images (`/public/images`) are cached immutably (1 year).
-   **Server Components**: We lean heavily on React Server Components (RSC) to reduce client-side bundle size.
-   **Lazy Loading**:
    -   Images below the fold use `loading="lazy"`.
    -   Heavy components (like the contact form or large visualizations) are lazy-loaded via `next/dynamic`.

### 3. Image Optimization
-   **Next.js Image**: All images use `<Image />` for automatic format selection (WebP/AVIF) and resizing.
-   **Script**: Run `npm run optimize-images` to bulk-optimize assets in `public/images`.

## Monitoring

### Lighthouse CI
Performance is guarded by CI/CD.
-   **Workflow**: `.github/workflows/lighthouse.yml` runs audit on every PR.
-   **Thresholds**: We aim for 90+ in Performance, Accessibility, Best Practices, and SEO.

### Manual Testing
To audit performance locally:
```bash
# 1. Build the worker
npm run build:worker

# 2. Preview locally
npm run preview

# 3. Run Lighthouse in Chrome DevTools against localhost
```

## Optimization Techniques Implemented

### Memoization
Critical UI components (Admin Dashboard tables) use `React.memo` and `useCallback` to prevent unnecessary re-renders during state updates (e.g., typing in a search box).

### Code Splitting
Next.js handles route-based code splitting automatically. We manually split:
-   `framer-motion` (only loaded where animations occur).
-   Admin dashboard charts (heavy libraries loaded on demand).

### Font Loading
-   **Self-hosted**: Fonts are loaded via `next/font/local` to avoid layout shifts (CLS) and external requests to Google Fonts.
-   **Preloading**: Critical subsets are preloaded.
