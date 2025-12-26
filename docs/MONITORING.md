# Monitoring Guide

This guide explains how to monitor the Jacob Barkin Portfolio website for uptime and performance issues.

## Health Check Endpoint

The site includes a dedicated health check endpoint at `/api/healthz` designed specifically for monitoring tools.

### Why Use /api/healthz?

Monitoring the main page (`/`) can lead to false positives because:
- SSR (Server-Side Rendering) takes time
- JavaScript bundles need to load
- Images and other assets add overhead
- Cloudflare WAF/Bot Fight Mode may challenge monitoring bots

The `/api/healthz` endpoint solves these issues by:
- Responding immediately with minimal processing
- Testing critical dependencies (database)
- Not requiring any assets to load
- Being exempt from most WAF rules
- Providing detailed diagnostic information

### Endpoint Details

**URL**: `https://jacobbarkin.com/api/healthz`

**Response Format**:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-26T19:30:00.000Z",
  "uptime": 123456789,
  "responseTime": 45,
  "version": "0.1.0",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 23
    }
  }
}
```

**Status Values**:
- `healthy`: All systems operational (HTTP 200)
- `degraded`: Reserved for future non-critical checks (HTTP 200)
- `unhealthy`: Critical failure, including database issues (HTTP 503)

## Setting Up Uptime Kuma

[Uptime Kuma](https://github.com/louislam/uptime-kuma) is a self-hosted monitoring tool.

### Configuration

1. **Create a new monitor**
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `Jacob Barkin Portfolio - Health`
   - URL: `https://jacobbarkin.com/api/healthz`
   - Heartbeat Interval: `60` seconds
   - Retries: `3`
   - Heartbeat Retry Interval: `30` seconds

2. **Advanced Settings**
   - Method: `GET`
   - Expected Status Code: `200`
   - Timeout: `10` seconds (health endpoint typically responds in <100ms)
   - Follow Redirects: `Yes`

3. **Notifications**
   - Set up your preferred notification channels (email, Slack, Discord, etc.)
   - Configure notification rules based on your needs

### Avoiding False Positives

The 48-second timeout issue mentioned in the problem statement was likely due to:
1. Monitoring a heavy page instead of a health endpoint
2. Cloudflare challenges blocking the monitor
3. DNS or network issues on the monitoring server

The `/api/healthz` endpoint addresses all these issues:
- Responds in milliseconds, not seconds
- No Cloudflare challenges (no JavaScript required)
- Simple enough to work even with network degradation

## Alternative Monitoring Services

### Better Stack (Recommended for external monitoring)

[Better Stack](https://betterstack.com/) offers free uptime monitoring with excellent diagnostics.

**Setup**:
1. Create a free account at betterstack.com
2. Add a new monitor
3. URL: `https://jacobbarkin.com/api/healthz`
4. Check frequency: 1-5 minutes
5. Expected status: `200`

**Benefits**:
- External monitoring (detects issues Kuma might miss)
- Traceroute/MTR features for diagnosing network issues
- Incident management
- Free tier available

### UptimeRobot

[UptimeRobot](https://uptimerobot.com/) is a popular free monitoring service.

**Setup**:
1. Create account at uptimerobot.com
2. Add New Monitor
3. Monitor Type: `HTTP(s)`
4. URL: `https://jacobbarkin.com/api/healthz`
5. Monitoring Interval: `5 minutes` (free tier)

### StatusCake

[StatusCake](https://www.statuscake.com/) offers free uptime monitoring.

**Setup**:
1. Sign up at statuscake.com
2. Add new uptime test
3. Website URL: `https://jacobbarkin.com/api/healthz`
4. Test type: `HTTP`
5. Check rate: Choose based on your plan

## Monitoring Strategy

### Recommended Setup

Use a **multi-layer monitoring approach**:

1. **Internal Monitoring (Uptime Kuma)**
   - Monitor `/api/healthz` every 60 seconds
   - Alerts you to issues from your monitoring server's perspective
   - Good for catching local network/DNS issues

2. **External Monitoring (Better Stack/UptimeRobot)**
   - Monitor `/api/healthz` every 3-5 minutes
   - Confirms issues are visible from external networks
   - Helps identify if problems are regional

3. **Optional: Monitor the main page**
   - Keep your existing monitor for `/` but increase timeout to 120 seconds
   - Set up separate alerts (lower priority)
   - Helps catch frontend-specific issues

### Interpreting Results

**Scenario 1: `/api/healthz` is up, `/` times out**
- **Cause**: Frontend issue (slow SSR, large bundles, broken JavaScript)
- **Action**: Check Cloudflare Workers logs, review page performance

**Scenario 2: Both endpoints down on Kuma, external monitors show up**
- **Cause**: Issue with your Kuma server (DNS, networking, routing)
- **Action**: Check Kuma server logs, DNS resolver, network connectivity

**Scenario 3: Both endpoints down on all monitors**
- **Cause**: Real outage or Cloudflare issue
- **Action**: Check Cloudflare dashboard, Workers logs

**Scenario 4: `/api/healthz` returns "unhealthy" status (503)**
- **Cause**: Database connectivity issues (binding missing or query failed)
- **Action**: Check D1 database status in Cloudflare dashboard

## Using Cloudflare Workers Logs

When you get a timeout alert, check the Workers logs to see if requests are reaching your Worker:

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Click on your worker (jacobbarkin)
4. Go to Logs section
5. Search for logs around the time of the timeout

**If logs show the request**:
- The timeout is happening in your Worker code
- Check what the health endpoint reported (database issues, etc.)
- Review any external API calls or slow operations

**If logs don't show the request**:
- The request never reached your Worker
- Likely DNS, networking, or WAF blocking
- Check Cloudflare Analytics for blocked requests

## Performance Testing Tools

For diagnosing intermittent slowness:

### Free Tools
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **WebPageTest**: https://www.webpagetest.org/
- **Chrome Lighthouse**: Built into Chrome DevTools
- **Pingdom Tools**: https://tools.pingdom.com/

### What to Check
- **TTFB (Time To First Byte)**: Should be <200ms for `/api/healthz`
- **Total response time**: Should be <500ms for `/api/healthz`
- **Error rates**: Check for any 5xx errors
- **Database response time**: Shown in health endpoint response

## Troubleshooting Common Issues

### Issue: Intermittent 48-second timeouts

**Diagnosis**:
1. Check if only Kuma sees it or external monitors too
2. Review Workers logs for those timestamps
3. Test endpoint manually during incident

**Solutions**:
- Switch to `/api/healthz` instead of `/`
- Increase Kuma timeout if needed
- Add external monitoring to confirm issues

### Issue: Health endpoint shows "unhealthy" status

**Diagnosis**:
1. Check the response body for specific error
2. Review database status in Cloudflare

**Solutions**:
- Database issue: Check D1 binding in wrangler.jsonc and verify database is accessible
- If persistent: Review Workers logs for errors

### Issue: Different monitors show different results

**Diagnosis**:
1. Note which locations/monitors see issues
2. Check if regional (specific geographic area)
3. Review DNS resolution from different locations

**Solutions**:
- If regional: May be Cloudflare routing or specific datacenter issue
- If DNS-related: Check DNS configuration and propagation
- If network-path: Use Better Stack's traceroute feature

## Best Practices

1. **Use the health endpoint** (`/api/healthz`) for primary monitoring
2. **Set reasonable timeouts**: 10-15 seconds for health checks
3. **Monitor from multiple locations**: Catch regional issues
4. **Set up proper alerting**: Don't rely on a single monitor
5. **Review logs regularly**: Check Workers logs weekly
6. **Test the monitoring**: Occasionally verify monitors are working
7. **Document incidents**: Note what caused outages for future reference

## Resources

- [Uptime Kuma Documentation](https://github.com/louislam/uptime-kuma/wiki)
- [Better Stack Uptime Monitoring](https://betterstack.com/uptime)
- [Cloudflare Workers Observability](https://developers.cloudflare.com/workers/observability/)
- [WebPageTest Documentation](https://docs.webpagetest.org/)

## Support

For issues with the health endpoint or monitoring setup:
1. Check this documentation first
2. Review the [Troubleshooting Guide](./troubleshooting-guide.md)
3. Check Workers logs in Cloudflare Dashboard
4. Contact via the [website contact form](https://jacobbarkin.com/contact)
