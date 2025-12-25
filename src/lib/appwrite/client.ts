// Appwrite client configuration
import { Client } from 'appwrite';

// Fallback values for development - DO NOT USE IN PRODUCTION
const fallbackConfig = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '6816ef35001da24d113d', // This should be set in environment variables
};

// Session persistence configuration
export const sessionConfig = {
  // Whether to use persistent sessions (true) or session-only cookies (false)
  persistentSessions: true,

  // Number of days to keep the session active (for persistent sessions)
  sessionDuration: 30,
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

  // Set response format to 1.0.0 for better compatibility
  try {
    // Use type assertion to access setHeader if it exists on the client
    const clientWithHeaders = client as unknown as { setHeader?: (key: string, value: string) => void };
    if (typeof clientWithHeaders.setHeader === 'function') {
      clientWithHeaders.setHeader('X-Appwrite-Response-Format', '1.0.0');

      // Add SameSite=None and Secure to cookies for cross-domain support
      clientWithHeaders.setHeader('Cookie-SameSite', 'None');
      clientWithHeaders.setHeader('Cookie-Secure', 'true');

      // Set session duration for persistent sessions
      if (sessionConfig.persistentSessions) {
        // Convert days to seconds for the cookie max-age
        const maxAge = sessionConfig.sessionDuration * 24 * 60 * 60;
        clientWithHeaders.setHeader('Cookie-Max-Age', maxAge.toString());
      }
    }
  } catch (error) {
    console.warn('Error setting Appwrite headers:', error);
  }

  return client;
}

// Export a singleton instance for convenience
export const client = createClient();
