# Content Management

The Jacob Barkin Portfolio uses a **code-first** content management approach. Content is stored directly in TSX files or JSON configuration, rather than a headless CMS.

## Adding Content

### Projects
Projects are hardcoded in the React components to allow for rich, custom stylingper project if desired.

**Source File**: `src/components/projects/project-detail.tsx` (or similar, depending on implementation).
To add a project:
1.  Locate the project data array or component structure.
2.  Add a new entry with title, description, and asset links.
3.  Add corresponding images to `public/images/projects/`.

### Blog / Articles
(If applicable) Articles are typically stored as MDX or separate page routes under `src/app/`.

## Static Assets

### Images
-   **Location**: `public/images/`
-   **Optimization**: Run `npm run optimize-all-images` to generate WebP variants.
-   **Usage**: Use the `<Image />` component from Next.js for automatic optimization.

### Fonts
-   **Location**: `public/fonts/`
-   **Loading**: Configured in `src/app/layout.tsx` using `next/font/local`.

## Embed Configuration
The "Designed by Jacob Barkin" embed script content is generated via:
-   **Source**: `src/app/api/embed/route.ts` (serves the JS).
-   **Instructions**: `public/embed/INSTRUCTIONS.md`.
