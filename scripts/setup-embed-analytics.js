#!/usr/bin/env node
/**
 * Setup script for Embed Analytics collection in Appwrite
 * Run with: node scripts/setup-embed-analytics.js
 */

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const config = {
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || '6816ef35001da24d113d',
  apiKey: process.env.APPWRITE_API_KEY || '',
  databaseId: process.env.APPWRITE_DATABASE_ID || 'contact-form-db',
  collectionId: 'embed-analytics',
};

const client = new Client();
client.setEndpoint(config.endpoint).setProject(config.projectId);

if (config.apiKey) {
  client.setKey(config.apiKey);
}

const databases = new Databases(client);

const stringAttributes = [
  // Core event data
  { key: 'event_type', size: 20, required: true },      // 'impression' or 'click'
  { key: 'timestamp', size: 30, required: true },       // ISO timestamp

  // Page info
  { key: 'referrer_url', size: 2048, required: true },  // Full URL of the page showing embed
  { key: 'referrer_domain', size: 255, required: true }, // Domain only (for grouping)
  { key: 'page_path', size: 500, required: false },     // Path portion of URL
  { key: 'page_title', size: 200, required: false },    // Page title

  // Embed config
  { key: 'variant', size: 20, required: false },        // chip, minimal, text
  { key: 'size', size: 20, required: false },           // small, default, large

  // Session & device
  { key: 'session_id', size: 50, required: false },     // Session ID for deduplication
  { key: 'device_type', size: 20, required: false },    // desktop, mobile, tablet
  { key: 'browser', size: 30, required: false },        // Chrome, Firefox, Safari, etc.
  { key: 'user_agent', size: 512, required: false },    // Full user agent string

  // Location
  { key: 'country', size: 5, required: false },         // Country code (2-3 chars)
  { key: 'city', size: 100, required: false },          // City name
  { key: 'region', size: 50, required: false },         // Region/state code
  { key: 'language', size: 10, required: false },       // Browser language
  { key: 'timezone', size: 50, required: false },       // Timezone
];

const integerAttributes = [
  // Screen dimensions
  { key: 'screen_width', required: false, min: 0, max: 10000 },
  { key: 'screen_height', required: false, min: 0, max: 10000 },
  { key: 'viewport_width', required: false, min: 0, max: 10000 },
  { key: 'viewport_height', required: false, min: 0, max: 10000 },
];

const indexes = [
  { key: 'event_type_idx', type: 'key', attributes: ['event_type'] },
  { key: 'referrer_domain_idx', type: 'key', attributes: ['referrer_domain'] },
  { key: 'timestamp_idx', type: 'key', attributes: ['timestamp'] },
  { key: 'session_idx', type: 'key', attributes: ['session_id'] },
  { key: 'device_type_idx', type: 'key', attributes: ['device_type'] },
  { key: 'country_idx', type: 'key', attributes: ['country'] },
];

async function setupCollection() {
  console.log('🔧 Setting up Embed Analytics collection...\n');
  console.log('Config:', { ...config, apiKey: config.apiKey ? '***' : 'NOT SET' });

  if (!config.apiKey) {
    console.error('\n❌ APPWRITE_API_KEY is required. Set it in your environment variables.');
    process.exit(1);
  }

  try {
    // Check if collection exists
    try {
      await databases.getCollection(config.databaseId, config.collectionId);
      console.log(`\n✓ Collection "${config.collectionId}" already exists.`);
    } catch (err) {
      if (err.code === 404) {
        console.log(`\nCreating collection "${config.collectionId}"...`);
        await databases.createCollection(
          config.databaseId,
          config.collectionId,
          'Embed Analytics',
          [
            Permission.create(Role.any()),  // Allow anyone to create (for tracking)
            Permission.read(Role.users()),  // Only authenticated users can read
          ]
        );
        console.log(`✓ Collection created.`);
      } else {
        throw err;
      }
    }

    // Create string attributes
    console.log('\nSetting up string attributes...');
    for (const attr of stringAttributes) {
      try {
        console.log(`  Creating string attribute: ${attr.key}...`);
        await databases.createStringAttribute(
          config.databaseId,
          config.collectionId,
          attr.key,
          attr.size,
          attr.required
        );
        console.log(`  ✓ ${attr.key} created.`);
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        if (err.code === 409) {
          console.log(`  - ${attr.key} already exists.`);
        } else {
          console.error(`  ✗ Error creating ${attr.key}:`, err.message);
        }
      }
    }

    // Create integer attributes
    console.log('\nSetting up integer attributes...');
    for (const attr of integerAttributes) {
      try {
        console.log(`  Creating integer attribute: ${attr.key}...`);
        await databases.createIntegerAttribute(
          config.databaseId,
          config.collectionId,
          attr.key,
          attr.required,
          attr.min,
          attr.max
        );
        console.log(`  ✓ ${attr.key} created.`);
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        if (err.code === 409) {
          console.log(`  - ${attr.key} already exists.`);
        } else {
          console.error(`  ✗ Error creating ${attr.key}:`, err.message);
        }
      }
    }

    // Create indexes
    console.log('\nSetting up indexes...');
    for (const idx of indexes) {
      try {
        console.log(`  Creating index: ${idx.key}...`);
        await databases.createIndex(
          config.databaseId,
          config.collectionId,
          idx.key,
          idx.type,
          idx.attributes
        );
        console.log(`  ✓ ${idx.key} created.`);
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        if (err.code === 409) {
          console.log(`  - ${idx.key} already exists.`);
        } else {
          console.error(`  ✗ Error creating ${idx.key}:`, err.message);
        }
      }
    }

    console.log('\n✅ Embed Analytics collection setup complete!');
    console.log('\nNext steps:');
    console.log('1. Add NEXT_PUBLIC_APPWRITE_EMBED_COLLECTION_ID=embed-analytics to your .env');
    console.log('2. Deploy your updated credit.js');
    console.log('3. View analytics at /admin/embed-analytics (requires admin login)');

  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    process.exit(1);
  }
}

setupCollection();

