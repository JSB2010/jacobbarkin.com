# Embed Feature ("Designed by Jacob Barkin")

This project hosts a distributable credit component that other sites can embed.
The public asset is a standalone browser script at `/embed/credit.js`.

## Technical Implementation

### Components
1. **Static Script Asset**: `public/embed/credit.js`
   - Generated from authored source at `src/embed/credit.js` by `npm run build:embed`.
   - Defines the `<jb-credit>` custom element.
   - Supports manual placement and `data-auto` injection.
   - Evaluates remote rules unless `data-no-rules` is present.
2. **Web Component**: `<jb-credit>`
   - Uses Shadow DOM when available so host-page styles do not leak in.
   - Falls back defensively when optional browser APIs are unavailable.
   - Targets Safari 12+ and current evergreen Chrome, Firefox, and Edge.
3. **Rules Engine**
   - Public evaluation endpoint: `/api/embed-rules/evaluate`.
   - Supported actions: `banner`, `redirect`, `credit_variant_override`, `page_takeover`, and `inline_replace`.
   - Legacy custom content fallback endpoint: `/api/embed-custom-content`, rendered through the same sandboxed takeover frame when used.
4. **Telemetry**
   - Analytics endpoint: `/api/embed-analytics`.
   - Heartbeat endpoint: `/api/embed-heartbeat`.
   - Canonical storage: `embed_events`.
   - Immediate site summaries: `embed_installations`.
   - Rollup reporting: `embed_daily_metrics`, rebuilt by the scheduled worker.

## Usage

Manual placement:
```html
<script src="https://jacobbarkin.com/embed/credit.js"></script>
<jb-credit data-variant="chip"></jb-credit>
```

Auto inject:
```html
<script src="https://jacobbarkin.com/embed/credit.js" data-auto></script>
```

Disable remote rules while keeping analytics enabled:
```html
<script src="https://jacobbarkin.com/embed/credit.js" data-auto data-no-rules></script>
```

Disable analytics and heartbeat:
```html
<jb-credit data-no-track></jb-credit>
```

Fixed footer with an offset:
```html
<jb-credit data-position="fixed" data-bottom-offset="16px"></jb-credit>
```

## Analytics Payload

The embed sends batched JSON events for `load`, `impression`, `click`, `heartbeat`,
`replacement_applied`, `replacement_skipped`, and `error`.

The `data-only` variant is invisible and emits heartbeat telemetry only.

Payload fields include:
- Page context: `page_url`, `page_host`, `page_path`, `page_title`, `referrer`, `referrer_host`, and UTM fields.
- Embed context: `embed_version`, `embed_variant`, `embed_size`, `embed_theme`, `embed_position`, `embed_align`, `embed_instance_id`, and `is_auto`.
- Reporting context: `site_key`, `installation_id`, `page_group`, `experiment_id`, `session_id`, and `page_view_id`.
- Runtime context: viewport size, `device_type`, `language`, `timezone_offset`, `connection_type`, `load_ms`, and `render_ms`.
- Rule context when present: `rule_id`, `template_id`, `action_type`, and `error_code`.

## Development

To modify the embed:
1. Edit `src/embed/credit.js`.
2. Run `npm run build:embed` to generate `public/embed/credit.js`.
3. Update `public/embed/INSTRUCTIONS.md`.
4. Run `npm run test:embed`.
5. Run `npm run generate:embed-instructions` so `src/app/embed/instructions.ts` stays in sync.
6. Use `/embed/smoke.html` or the `/embed` page to browser-check manual, auto, data-only, fixed, and duplicate-script scenarios.
