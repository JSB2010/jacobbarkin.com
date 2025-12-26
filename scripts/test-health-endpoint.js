#!/usr/bin/env bun

/**
 * Simple test script to verify the /api/healthz endpoint is working
 * 
 * Usage:
 *   bun scripts/test-health-endpoint.js [url]
 * 
 * Examples:
 *   bun scripts/test-health-endpoint.js
 *   bun scripts/test-health-endpoint.js http://localhost:3000/api/healthz
 *   bun scripts/test-health-endpoint.js https://jacobbarkin.com/api/healthz
 */

// Default URL - can be overridden via command line argument or environment variable
const DEFAULT_URL = process.env.HEALTH_ENDPOINT_URL || 'http://localhost:3000/api/healthz';
const url = process.argv[2] || DEFAULT_URL;

console.log(`Testing health endpoint: ${url}\n`);

async function testHealthEndpoint() {
  const startTime = Date.now();
  
  try {
    // Test GET request
    console.log('Testing GET request...');
    const getResponse = await fetch(url);
    const getTime = Date.now() - startTime;
    
    console.log(`✓ GET Response Status: ${getResponse.status} ${getResponse.statusText}`);
    console.log(`✓ Response Time: ${getTime}ms`);
    
    if (getResponse.status !== 200 && getResponse.status !== 503) {
      console.error(`✗ Unexpected status code: ${getResponse.status}`);
      process.exit(1);
    }
    
    const data = await getResponse.json();
    console.log('\n📊 Health Check Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Validate response structure
    console.log('\n🔍 Validating response structure...');
    
    const requiredFields = ['status', 'timestamp', 'uptime', 'version', 'environment', 'checks'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.error(`✗ Missing required fields: ${missingFields.join(', ')}`);
      process.exit(1);
    }
    
    console.log('✓ All required fields present');
    
    // Validate status value
    const validStatuses = ['healthy', 'degraded', 'unhealthy'];
    if (!validStatuses.includes(data.status)) {
      console.error(`✗ Invalid status value: ${data.status}`);
      process.exit(1);
    }
    
    console.log(`✓ Status is valid: ${data.status}`);
    
    // Check database status
    if (data.checks?.database?.status === 'error') {
      console.warn(`⚠ Database check failed: ${data.checks.database.message}`);
    } else if (data.checks?.database?.status === 'unavailable') {
      console.warn(`⚠ Database unavailable: ${data.checks.database.message}`);
    } else {
      console.log(`✓ Database check: ${data.checks?.database?.status}`);
    }
    
    // Check config status
    if (data.checks?.config?.status === 'error') {
      console.warn(`⚠ Config check failed: ${data.checks.config.message}`);
    } else {
      console.log(`✓ Config check: ${data.checks?.config?.status}`);
    }
    
    // Test HEAD request
    console.log('\nTesting HEAD request...');
    const headStartTime = Date.now();
    const headResponse = await fetch(url, { method: 'HEAD' });
    const headTime = Date.now() - headStartTime;
    
    console.log(`✓ HEAD Response Status: ${headResponse.status} ${headResponse.statusText}`);
    console.log(`✓ HEAD Response Time: ${headTime}ms`);
    
    if (headResponse.status !== 200 && headResponse.status !== 503) {
      console.error(`✗ Unexpected HEAD status code: ${headResponse.status}`);
      process.exit(1);
    }
    
    // Test OPTIONS request (CORS)
    console.log('\nTesting OPTIONS request (CORS)...');
    const optionsResponse = await fetch(url, { method: 'OPTIONS' });
    console.log(`✓ OPTIONS Response Status: ${optionsResponse.status} ${optionsResponse.statusText}`);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': optionsResponse.headers.get('access-control-allow-origin'),
      'Access-Control-Allow-Methods': optionsResponse.headers.get('access-control-allow-methods'),
    };
    
    console.log('\n📋 CORS Headers:');
    console.log(JSON.stringify(corsHeaders, null, 2));
    
    // Summary
    console.log('\n✅ Health endpoint tests passed!');
    console.log(`\nSummary:`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Response Time: ${getTime}ms`);
    console.log(`  Uptime: ${Math.floor(data.uptime / 1000)}s`);
    console.log(`  Database: ${data.checks?.database?.status || 'unknown'}`);
    console.log(`  Config: ${data.checks?.config?.status || 'unknown'}`);
    
    if (data.status === 'degraded') {
      console.log('\n⚠ Service is degraded - check warnings above');
      process.exit(0); // Still exit successfully as degraded is operational
    } else if (data.status === 'unhealthy') {
      console.log('\n❌ Service is unhealthy');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Health endpoint test failed!');
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nIs the server running? Try: bun run dev');
    }
    
    process.exit(1);
  }
}

// Run the test
testHealthEndpoint();
