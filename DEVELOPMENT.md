# Development Guide

This comprehensive guide covers setting up your local environment, running the project, understanding the core development workflows, and troubleshooting common issues.

## Prerequisites

-   **Node.js**: Version 18.17 or later (Required for Next.js 15).
-   **Package Manager**: `npm` (Project uses `npm` scripts but supports `bun`).
-   **Git**: For version control.
-   **Cloudflare Account**: Required for deploying Workers and managing D1 databases.
-   **Wrangler CLI**: `npm install -g wrangler` (for local D1 management).

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/JSB2010/jacobbarkin.com.git
    cd jacobbarkin.com
    ```

2.  **Install dependencies**:
    ```bash
    # using npm
    npm install
    # or using bun
    bun install
    ```

3.  **Environment Setup**:
    Copy the example environment file:
    ```bash
    cp .env.example .env.local
    ```

    Update `.env.local` to include your specific credentials.

4.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    This runs the Next.js dev server with Turbopack enabled. Open [http://localhost:3000](http://localhost:3000) to view the site.
    To skip pulling a fresh D1 snapshot, use:
    ```bash
    npm run dev:no-pull
    ```
    If you want to force the Cloudflare D1 binding during dev (instead of the local snapshot), unset `NEXT_DEV_USE_LOCAL_D1` or run the worker preview.
    For a full worker-like dev loop against the remote D1 binding, run:
    ```bash
    bun run dev:remote
    ```

## Environment Variables

The application uses environment variables for configuration, authentication, and external services.

### Client-Side (Next.js)
These variables are prefixed with `NEXT_PUBLIC_` and are exposed to the browser.

| Variable | Description | Required | Source |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Auth Public Key | Yes | Clerk Dashboard |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL of the site | Yes | `https://jacobbarkin.com` |

### Server-Side (Next.js / Workers)
These variables are kept private and used only on the server.

| Variable | Description | Required | Source |
| :--- | :--- | :--- | :--- |
| `CLERK_SECRET_KEY` | Clerk Auth Secret Key | Yes | Clerk Dashboard |
| `RESEND_API_KEY` | API Key for transactional emails | Yes | Resend Dashboard |
| `ADMIN_EMAIL` | Email receiving contact form submissions | Yes | Your Email |
| `CLOUDFLARE_API_TOKEN` | Token for deploying via CI/CD | CI Only | Cloudflare Dashboard |

> **Note**: In production (Cloudflare Workers), sensitive variables like `CLERK_SECRET_KEY` must be set via `wrangler secret put` or the Cloudflare Dashboard. They are NOT read from `.env` files in production.

## Database Management (D1)

The project uses **Cloudflare D1** (SQLite) for storing persistent data like contact form submissions.

### Local Development
When you run `npm run dev`, the app pulls a snapshot from remote D1 and then runs using a local SQLite-backed D1 shim (via `node:sqlite`, with a `better-sqlite3` fallback) so you can use Turbopack + HMR without running a worker build. The database file is created at `.wrangler/local-d1.sqlite` and `src/lib/db/schema.sql` is applied automatically. To change the location, set `LOCAL_D1_PATH` in `.env.local`. The dev scripts also set `NEXT_DEV_USE_LOCAL_D1=1` to bypass the Wrangler-provided D1 binding, and they invoke `next dev` via Node to ensure the SQLite driver is available.

To hydrate your local database with production data (snapshot) on demand:
```bash
bun run d1:pull
```
This exports the remote D1 database to `.wrangler/remote-d1.sql`, rebuilds `.wrangler/local-d1.sqlite`, and the dev server will use that data on the next request.
If you use a different D1 database name, set `D1_DATABASE_NAME` in `.env.local`.

To manually interact with your **local** D1 database:
```bash
# Execute SQL query against local DB
npx wrangler d1 execute jacobbarkin-db --local --command "SELECT * FROM contact_submissions"

# Apply migrations locally
npx wrangler d1 migrations apply jacobbarkin-db --local
```

### Production Database
To interact with the **production** database:
```bash
# Execute SQL query against production DB (Use with CAUTION)
npx wrangler d1 execute jacobbarkin-db --remote --command "SELECT * FROM contact_submissions"
```

## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `next dev --turbopack` | Starts local dev server with Turbopack (fast HMR). |
| `dev:no-turbo` | `next dev` | Starts local dev server without Turbopack (legacy mode). |
| `build` | `next build` | Standard Next.js build (creates `.next/`). |
| `build:worker` | `opennextjs-cloudflare build` | Builds the app for Cloudflare Workers (creates `.open-next/`). |
| `preview` | `opennextjs-cloudflare preview` | Builds and previews the worker locally using Wrangler. |
| `deploy` | `opennextjs-cloudflare deploy` | Deploys the worker to Cloudflare (requires login). |
| `lint` | `eslint ...` | Runs code quality checks. |
| `check-a11y` | `bunx @axe-core/cli ...` | Runs accessibility audits on the homepage. |
| `test:health` | `bun scripts/test-health-endpoint.js` | Verifies the `/api/healthz` endpoint. |

## Troubleshooting

### "Binding DB not found"
If you see errors related to `env.DB` being undefined during development, ensure your `wrangler.jsonc` has the correct `d1_databases` binding configuration and that you have run `wrangler types` to generate the TypeScript definitions.

### "Clerk: Missing Publishable Key"
Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in your `.env.local` file. Restart the dev server after changes.

### OpenNext / Worker Build Failures
If `npm run build:worker` fails:
1.  Clear the cache: `rm -rf .open-next .next`
2.  Ensure you are using a compatible Node.js version (v18+).
3.  Check for edge-incompatible code (e.g., `fs` usage in client components).
