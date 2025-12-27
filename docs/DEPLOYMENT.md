# Deployment Guide

This guide details the deployment pipeline for the Jacob Barkin Portfolio, focusing on **Cloudflare Workers** via **OpenNext**.

## Pipeline Overview

The project uses **GitHub Actions** for Continuous Integration and Deployment (CI/CD). Deployments are triggered automatically on pushes to the `main` branch.

### Workflow: `Lighthouse CI`
Located in `.github/workflows/lighthouse.yml`.
-   **Trigger**: Push to `main` or Pull Request.
-   **Steps**:
    1.  **Checkout**: Clones the repo.
    2.  **Setup Bun**: Uses `bun` for fast dependency installation.
    3.  **Build**: Runs `bun run build`.
    4.  **Audit**: Runs **Lighthouse CI** against specific URLs (Home, About, Contact) to ensure performance scores don't regress.
    5.  **Artifacts**: Uploads Lighthouse reports for review.

### Deployment (Manual)

While CI/CD handles production, you may need to deploy manually for testing.

1.  **Build the Worker**:
    ```bash
    npm run build:worker
    ```
    This invokes `opennextjs-cloudflare build` which:
    -   Builds the Next.js app.
    -   Transforms it into a single Worker script (`.open-next/worker.js`).
    -   Extracts static assets to `.open-next/assets`.

2.  **Deploy**:
    ```bash
    npx wrangler deploy
    ```
    This uploads the script and assets to the Cloudflare network under the `jacobbarkin` worker name.

## Wrangler Commands

The `wrangler` CLI is your primary tool for managing the live deployment.

-   **Tail Logs**: Watch real-time logs from the production worker.
    ```bash
    npx wrangler pages deployment tail
    # OR for worker
    npx wrangler tail
    ```

-   **Manage Secrets**: Set sensitive environment variables.
    ```bash
    npx wrangler secret put CLERK_SECRET_KEY
    ```

-   **Database Interactions**:
    ```bash
    # Execute SQL on production
    npx wrangler d1 execute jacobbarkin-db --remote --command "SELECT count(*) FROM contact_submissions"
    ```

## Post-Deployment Verification

After a deployment, verify the following:

1.  **Health Check**: Visit `/api/healthz` (if implemented) or simply define a smoke test.
2.  **Auth**: Try accessing `/admin`. You should be redirected to Clerk.
3.  **Contact Form**: Send a test message and verify:
    -   You get a success message.
    -   The email arrives (Resend).
    -   The entry appears in D1 (use `wrangler d1 execute`).

## Troubleshooting Deployments

-   **Asset 404s**: If images or styles are missing, the `ASSETS` binding might be misconfigured in `wrangler.jsonc` or the static asset upload failed.
-   **500 Errors**: Use `npx wrangler tail` to see the runtime exception. Common causes include missing secrets or DB binding mismatches.
