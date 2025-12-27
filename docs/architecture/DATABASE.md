# Database Schema

The project uses **Cloudflare D1** (SQLite) to store persistent data.
The database binding in `wrangler.jsonc` is `DB`.

## Tables

### `contact_submissions`
Stores messages submitted via the contact form.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT | UUID (Primary Key) |
| `name` | TEXT | Sender's name |
| `email` | TEXT | Sender's email |
| `subject` | TEXT | Message subject |
| `message` | TEXT | Message body |
| `status` | TEXT | Processing status (e.g., 'new') |
| `priority` | INTEGER | Priority level (Default: 1) |
| `created_at` | TEXT | ISO Timestamp |
| `updated_at` | TEXT | ISO Timestamp |
| `ip_address` | TEXT | Client IP (for rate limiting/abuse) |
| `user_agent` | TEXT | Client User Agent |
| `source` | TEXT | Submission source (e.g., 'website_contact_form') |

### `embed_analytics`
Stores telemetry data from the "Designed by Jacob Barkin" embed widget.

| Column | Type | Description |
| :--- | :--- | :--- |
| `event_type` | TEXT | 'impression' or 'click' |
| `page_url` | TEXT | URL where the embed is hosted |
| `page_host` | TEXT | Hostname (e.g., 'example.com') |
| `embed_version` | TEXT | Version of the embed script |
| `embed_variant` | TEXT | Style variant (e.g., 'prominent') |
| `is_auto` | INTEGER | 1 if auto-injected, 0 if manual |
| `referrer` | TEXT | Referrer URL |
| `created_at` | TEXT | ISO Timestamp |

## Migrations

Migrations are managed via Wrangler and stored in the `migrations/` directory.

```bash
# Apply migrations locally
npx wrangler d1 migrations apply jacobbarkin-db --local

# Apply migrations to production
npx wrangler d1 migrations apply jacobbarkin-db --remote
```
