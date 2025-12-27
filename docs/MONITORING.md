# Monitoring Guide

This guide explains how to monitor the Jacob Barkin Portfolio for uptime and performance.

## Health Check Endpoint

The site includes a dedicated health check endpoint: `/api/healthz`.

### Response Format
```json
{
  "status": "healthy",
  "timestamp": "2024-12-26T19:30:00.000Z",
  "checks": {
    "database": { "status": "ok", "responseTime": 23 }
  }
}
```

-   **Healthy (200)**: Worker is up, D1 is reachable.
-   **Unhealthy (503)**: Worker is up, but D1 binding failed or query timed out.

## Observability Strategy

### 1. Cloudflare Dashboard
The primary source of truth is the **Workers & Pages** dashboard.
-   **Requests**: View total volume and error rate (5xx).
-   **CPU Time**: Ensure you aren't hitting Worker limits.
-   **Logs**: Use "Begin log stream" to see real-time `console.log` output.

### 2. Live Logs (CLI)
You can tail logs from your terminal:
```bash
npx wrangler tail
```
This is useful for debugging 500 errors immediately after a deployment.

### 3. Database Monitoring
Monitor D1 usage (Reads/Writes) in the **D1** section of the Cloudflare Dashboard. Heavy write spikes might indicate a contact form spam attack.

### 4. CI/CD Monitoring
The **Lighthouse CI** action in GitHub (under `.github/workflows/lighthouse.yml`) acts as a monitoring tool for *performance regressions*.
-   Check the "Actions" tab in GitHub after every push to see the latest scores.
