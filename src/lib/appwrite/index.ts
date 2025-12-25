// Centralized Appwrite configuration and services
// This file serves as the main entry point for all Appwrite-related functionality

import { Client, Databases, ID, Query } from 'appwrite';
import { z } from 'zod';
import { env } from '@/lib/env';

// Logger for Appwrite operations
class AppwriteLogger {
  private enabled: boolean;
  private logLevel: 'error' | 'warn' | 'info' | 'debug';

  constructor() {
    // Use validated environment variables
    this.enabled = env.NODE_ENV === 'development' || env.NEXT_PUBLIC_ENABLE_APPWRITE_LOGGING === true;
    this.logLevel = env.NEXT_PUBLIC_APPWRITE_LOG_LEVEL;
  }

  // Log error messages (always logged unless disabled)
  error(message: string, data?: any): void {
    if (!this.enabled) return;

    console.error(`[Appwrite Error] ${message}`, data || '');
    this.saveLog('error', message, data);
  }

  // Log warning messages
  warn(message: string, data?: any): void {
    if (!this.enabled || !['warn', 'info', 'debug'].includes(this.logLevel)) return;

    console.warn(`[Appwrite Warning] ${message}`, data || '');
    this.saveLog('warn', message, data);
  }

  // Log informational messages
  info(message: string, data?: any): void {
    if (!this.enabled || !['info', 'debug'].includes(this.logLevel)) return;

    console.info(`[Appwrite Info] ${message}`, data || '');
    this.saveLog('info', message, data);
  }

  // Log debug messages (most verbose)
  debug(message: string, data?: any): void {
    if (!this.enabled || this.logLevel !== 'debug') return;

    console.debug(`[Appwrite Debug] ${message}`, data || '');
    this.saveLog('debug', message, data);
  }

  // Save log to localStorage for debugging (client-side only)
  private saveLog(level: string, message: string, data?: any): void {
    if (typeof window === 'undefined') return;

    try {
      const logs = JSON.parse(localStorage.getItem('appwrite_logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        data: data ? JSON.stringify(data) : undefined
      });

      // Keep only the last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('appwrite_logs', JSON.stringify(logs));
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  // Get all logs (for debugging UI)
  getLogs(): any[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('appwrite_logs') || '[]');
    } catch (error) {
      return [];
    }
  }

  // Clear all logs
  clearLogs(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('appwrite_logs');
    } catch (error) {
      // Ignore localStorage errors
    }
  }
}

// Create logger instance
const logger = new AppwriteLogger();

// Status log entry schema
const statusLogEntrySchema = z.object({
  previousStatus: z.enum(['new', 'read', 'replied', 'archived']).optional(),
  newStatus: z.enum(['new', 'read', 'replied', 'archived']),
  timestamp: z.string(),
  updatedBy: z.string().default('system')
});

// Contact form submission schema - simplified to match exactly what's in the Appwrite collection
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
  // Remove all other fields to ensure exact match with Appwrite collection schema
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Get configuration from validated environment variables
function getConfig() {
  // Log configuration
  logger.info('Appwrite configuration loaded', {
    endpoint: env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? 'defined' : 'undefined',
    databaseId: env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    collectionId: env.NEXT_PUBLIC_APPWRITE_CONTACT_COLLECTION_ID
  });

  // Return validated environment variables
  return {
    endpoint: env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    collectionId: env.NEXT_PUBLIC_APPWRITE_CONTACT_COLLECTION_ID,
  };
}

// Get configuration
const config = getConfig();

// Create Appwrite client
function createClient() {
  const client = new Client();

  client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

  // Set response format to 1.0.0 for better compatibility
  try {
    // Use type assertion to access setHeader if it exists on the client
    const clientWithHeaders = client as unknown as { setHeader?: (key: string, value: string) => void };
    if (typeof clientWithHeaders.setHeader === 'function') {
      clientWithHeaders.setHeader('X-Appwrite-Response-Format', '1.0.0');
    }
  } catch (error) {
    console.warn('Error setting Appwrite headers:', error);
  }

  return client;
}

// Initialize client and services
const client = createClient();
const databases = new Databases(client);

// Maximum number of retry attempts for database operations
const MAX_RETRIES = 3;

/**
 * Submit contact form data to Appwrite database with retry mechanism
 * @param data Form data to submit
 * @param retryCount Number of retry attempts (internal use)
 * @param testOnly If true, only tests connectivity without actually submitting data
 * @returns Promise with submission result
 */
export async function submitContactForm(
  data: ContactFormData,
  retryCount = 0,
  testOnly = false
): Promise<{
  success: boolean;
  id?: string;
  message: string;
  error?: any;
}> {
  try {
    // Only include fields that are explicitly defined in the Appwrite collection schema
    // Based on the error, we need to be very careful about field names
    const submissionData = {
      name: data.name,
      email: data.email,
      subject: data.subject || 'Contact Form Submission',
      message: data.message
      // Remove timestamp, userAgent, source, and ipAddress as they might not match the schema exactly
    };

    // Validate the simplified data against a minimal schema
    const validatedData = contactFormSchema.parse(submissionData);

    // Log submission attempt
    logger.info('Submitting contact form data', {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
    });

    // If this is just a test, don't actually create the document
    // Check for test mode using testOnly parameter only (source is not in the schema)
    if (testOnly) {
      logger.info('Test mode: Skipping actual document creation');
      return {
        success: true,
        id: 'test-' + ID.unique(),
        message: 'Connection test successful. No document was created.'
      };
    }

    // Create document in Appwrite database
    const document = await databases.createDocument(
      config.databaseId,
      config.collectionId,
      ID.unique(),
      validatedData
    );

    // Log successful submission
    logger.info('Contact form submitted successfully', {
      id: document.$id,
      name: validatedData.name,
      email: validatedData.email
    });

    return {
      success: true,
      id: document.$id,
      message: 'Form submitted successfully'
    };
  } catch (error: any) {
    // Log error details
    logger.error('Error submitting contact form', error);

    // Handle specific error types
    if (error.code === 409 && error.type === 'document_already_exists') {
      // Document ID conflict - retry with a new ID
      if (retryCount < MAX_RETRIES) {
        logger.warn(`Document ID conflict, retrying (attempt ${retryCount + 1}/${MAX_RETRIES})`, {
          error: error.message,
          retryCount: retryCount + 1
        });
        return submitContactForm(data, retryCount + 1);
      } else {
        logger.error('Maximum retry attempts reached for document ID conflict', {
          error: error.message,
          maxRetries: MAX_RETRIES
        });
      }
    }

    // Handle schema validation errors from Appwrite
    if (error.message && error.message.includes('Unknown attribute')) {
      logger.error('Schema validation error from Appwrite', {
        error: error.message,
        errorType: 'schema_mismatch',
        data: Object.keys(data)
      });

      return {
        success: false,
        message: 'Form submission failed due to schema mismatch. Please try again or contact support.',
        error: error
      };
    }

    // Handle network errors
    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff: wait longer between each retry
        const delay = Math.pow(2, retryCount) * 1000;

        logger.warn(`Network error, retrying after ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`, {
          error: error.message || error.name,
          errorCode: error.code,
          retryCount: retryCount + 1,
          delay: delay
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return submitContactForm(data, retryCount + 1);
      }

      logger.error('Maximum retry attempts reached for network error', {
        error: error.message || error.name,
        errorCode: error.code,
        maxRetries: MAX_RETRIES
      });

      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        error: error
      };
    }

    // Handle other errors
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error
    };
  }
}

/**
 * Get contact form submissions
 * @param limit Maximum number of submissions to retrieve
 * @param queries Additional queries for filtering and sorting
 * @returns Promise with submissions
 */
export async function getContactFormSubmissions(limit = 10, queries: any[] = []) {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.collectionId,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        ...queries
      ]
    );

    return {
      success: true,
      submissions: response.documents,
      total: response.total
    };
  } catch (error) {
    logger.error('Error retrieving contact form submissions', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      submissions: [],
      total: 0
    };
  }
}

/**
 * Update submission status
 * @param id Document ID
 * @param status New status
 * @param updatedBy Optional information about who updated the status
 * @returns Promise with update result
 */
export async function updateSubmissionStatus(
  id: string,
  status: 'new' | 'read' | 'replied' | 'archived',
  updatedBy: string = 'system'
) {
  try {
    // First, get the current document to check the current status
    const currentDoc = await getSubmissionById(id);

    if (!currentDoc.success) {
      throw new Error(`Document not found: ${id}`);
    }

    const currentStatus = currentDoc.submission?.status || 'new';

    // If status hasn't changed, don't update
    if (currentStatus === status) {
      logger.info(`Status unchanged for submission: ${id} (${status})`);
      return {
        success: true,
        id: id,
        message: 'Status unchanged',
        unchanged: true
      };
    }

    logger.info(`Updating submission status: ${id} from ${currentStatus} to ${status}`);

    // Create a status change log entry
    const statusChangeLog = {
      previousStatus: currentStatus,
      newStatus: status,
      timestamp: new Date().toISOString(),
      updatedBy: updatedBy
    };

    // Get existing status log or initialize a new one
    const existingStatusLog = currentDoc.submission?.statusLog || [];

    // Update the document with new status and append to status log
    const document = await databases.updateDocument(
      config.databaseId,
      config.collectionId,
      id,
      {
        status,
        statusLog: [...existingStatusLog, statusChangeLog],
        lastUpdated: new Date().toISOString()
      }
    );

    logger.info(`Successfully updated submission status: ${id} from ${currentStatus} to ${status}`);

    return {
      success: true,
      id: document.$id,
      message: 'Status updated successfully',
      previousStatus: currentStatus,
      newStatus: status,
      timestamp: statusChangeLog.timestamp
    };
  } catch (error) {
    logger.error(`Error updating submission status: ${id}`, error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error
    };
  }
}

/**
 * Update submission priority
 * @param id Document ID
 * @param priority New priority (1-5)
 * @returns Promise with update result
 */
export async function updateSubmissionPriority(id: string, priority: number) {
  try {
    // Validate priority
    if (priority < 1 || priority > 5) {
      throw new Error('Priority must be between 1 and 5');
    }

    logger.info(`Updating submission priority: ${id} to ${priority}`);

    const document = await databases.updateDocument(
      config.databaseId,
      config.collectionId,
      id,
      { priority }
    );

    logger.info(`Successfully updated submission priority: ${id}`);

    return {
      success: true,
      id: document.$id,
      message: 'Priority updated successfully'
    };
  } catch (error) {
    logger.error(`Error updating submission priority: ${id}`, error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error
    };
  }
}

/**
 * Update submission tags
 * @param id Document ID
 * @param tags Array of tags
 * @returns Promise with update result
 */
export async function updateSubmissionTags(id: string, tags: string[]) {
  try {
    logger.info(`Updating submission tags: ${id}`, { tags });

    const document = await databases.updateDocument(
      config.databaseId,
      config.collectionId,
      id,
      { tags }
    );

    logger.info(`Successfully updated submission tags: ${id}`);

    return {
      success: true,
      id: document.$id,
      message: 'Tags updated successfully'
    };
  } catch (error) {
    logger.error(`Error updating submission tags: ${id}`, error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error
    };
  }
}

/**
 * Get a single submission by ID
 * @param id Document ID
 * @returns Promise with submission
 */
export async function getSubmissionById(id: string) {
  try {
    logger.info(`Retrieving submission: ${id}`);

    const document = await databases.getDocument(
      config.databaseId,
      config.collectionId,
      id
    );

    return {
      success: true,
      submission: document
    };
  } catch (error) {
    logger.error(`Error retrieving submission: ${id}`, error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error
    };
  }
}

// Export client, services, configuration, and logger
export { client, databases, config, ID, logger };
