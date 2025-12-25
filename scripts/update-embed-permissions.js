#!/usr/bin/env node
/**
 * Update permissions for embed-analytics collection to allow anonymous writes
 */

const https = require('https');

const config = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || '6816ef35001da24d113d',
  apiKey: process.env.APPWRITE_API_KEY || '',
  databaseId: 'contact-form-db',
  collectionId: 'embed-analytics',
};

if (!config.apiKey) {
  console.error('APPWRITE_API_KEY is required');
  process.exit(1);
}

const url = new URL(`${config.endpoint}/databases/${config.databaseId}/collections/${config.collectionId}`);

const requestBody = JSON.stringify({
  name: 'Embed Analytics',
  permissions: [
    'create("any")',
    'read("users")',
  ]
});

const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': config.projectId,
    'X-Appwrite-Key': config.apiKey,
    'Content-Length': Buffer.byteLength(requestBody),
  },
};

console.log('Updating collection permissions...');
console.log('URL:', url.href);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✓ Permissions updated successfully!');
      try {
        const result = JSON.parse(data);
        console.log('New permissions:', result.$permissions);
      } catch (e) {
        console.log('Response:', data);
      }
    } else {
      console.error('Error:', res.statusCode, data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(requestBody);
req.end();
