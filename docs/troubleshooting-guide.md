# Troubleshooting Guide

Solutions for common issues encountering during development and deployment of the Jacob Barkin Portfolio.

## Development Issues

### "Binding DB not found"
**Symptom**: `env.DB` is undefined in the API route.
**Cause**: The Wrangler proxy hasn't bound the local D1 database.
**Solution**:
1.  Ensure you are running `npm run dev`.
2.  Verify `wrangler.jsonc` has the `d1_databases` binding correctly configured.
3.  Run `npx wrangler types` to update TypeScript definitions.

### "Clerk: Missing Publishable Key"
**Symptom**: App crashes on load with a Clerk error.
**Cause**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing from `.env.local`.
**Solution**: Copy the key from the Clerk Dashboard to your local environment file.

### OpenNext Build Failures
**Symptom**: `npm run build:worker` fails.
**Cause**: Using Node.js APIs not supported by the Edge runtime (like `fs`) in Client Components.
**Solution**:
1.  Move filesystem logic to Server Actions or API Routes.
2.  Check for edge-incompatible dependencies.
3.  Clear the cache: `rm -rf .open-next .next`.

## Deployment Issues

### 500 Internal Server Error (Production)
**Symptom**: The site loads but API routes fail, or the whole site is down.
**Solution**:
1.  Tail the logs: `npx wrangler tail`.
2.  Check for missing secrets: Did you run `wrangler secret put CLERK_SECRET_KEY`?
3.  Check Database Binding: Ensure the production D1 database ID in `wrangler.jsonc` matches your actual D1 database ID.

### Assets 404 Not Found
**Symptom**: Images or styles are missing.
**Cause**: The `ASSETS` binding in `wrangler.jsonc` might be misconfigured, or usage of `fs` to read files that weren't included in the build.
**Solution**:
1.  Ensure standard assets are in `/public`.
2.  Verify `open-next.config.ts` settings.

### Database Query Fails (Remote)
**Symptom**: Contact form fails to save.
**Solution**:
1.  Check if the table exists: `npx wrangler d1 execute jacobbarkin-db --remote --command "SELECT count(*) FROM contact_submissions"`
2.  If the table is missing, run migrations: `npx wrangler d1 migrations apply jacobbarkin-db --remote`

## Performance Issues

### High TTFB (Time to First Byte)
**Cause**: Cold starts or heavy server-side logic.
**Solution**:
1.  Cloudflare Workers generally have 0ms cold start, but heavy DB queries can slow it down.
2.  Check lighthouse report (`npm run monitor-performance` is deprecated, use the GitHub Action).

### Large Bundle Size
**Solution**:
1.  Use `next/dynamic` for heavy components.
2.  Analyze bundle: `npm run analyze-bundle` (requires `@next/bundle-analyzer`).
