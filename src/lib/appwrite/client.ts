// Appwrite client configuration
import { Client } from 'appwrite';

// Fallback values for development - DO NOT USE IN PRODUCTION
const fallbackConfig = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '6816ef35001da24d113d', // This should be set in environment variables
};

/**
 * Create and configure an Appwrite client
 * @returns Configured Appwrite client
 */
export function createClient(): Client {
  const client = new Client();

  // Configure client with environment variables or fallback values
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? fallbackConfig.endpoint)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? fallbackConfig.projectId);

  return client;
}

// Export a singleton instance for convenience
export const client = createClient();
