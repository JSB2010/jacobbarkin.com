# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automating CI/CD tasks for jacobbarkin.com.

## Available Workflows

### 1. Cloudflare Workers Deployment (`cloudflare-workers.yml`)

Builds and deploys the website to Cloudflare Workers.

**Triggers:** Push/PR to `modern-redesign-shadcn`, manual dispatch

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

---

### 2. Security Scanning (`security.yml`)

Runs security audits and CodeQL static analysis.

**Triggers:** Push/PR to `modern-redesign-shadcn`, weekly schedule (Sundays), manual dispatch

**Jobs:**
- **Dependency Audit** - Runs `bun audit` and ESLint security rules
- **CodeQL Analysis** - Static code analysis for JavaScript/TypeScript vulnerabilities

---

### 3. Lighthouse CI (`lighthouse.yml`)

Runs performance, accessibility, and SEO audits against the live site.

**Triggers:** Push/PR to `modern-redesign-shadcn`, weekly schedule (Mondays), manual dispatch

**Jobs:**
- Desktop audit (all pages)
- Mobile audit (key pages)

**Artifacts:** Lighthouse reports saved for 30 days

---

## Setting Up Secrets

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Add these repository secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

## Related Configuration Files

- `.github/codeql-config.yml` - CodeQL analysis configuration
- `.github/lighthouse-config.json` - Lighthouse CI thresholds
- `.github/dependabot.yml` - Automated dependency updates
- `.github/CODEOWNERS` - Code ownership for reviews
