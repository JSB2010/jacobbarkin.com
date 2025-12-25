// Unified Contact Form API
// This file provides a centralized API for all contact form implementations

import { z } from 'zod';
import { contactFormSchema, submitContactForm as submitToAppwrite, logger } from '@/lib/appwrite';

// Submission methods
export enum SubmissionMethod {
  APPWRITE = 'appwrite',
  API = 'api',
  EMAIL = 'email',
}

// Configuration for the contact form API
export interface ContactFormConfig {
  method: SubmissionMethod;
  endpoint?: string; // For API method
  emailAddress?: string; // For EMAIL method
}

// Default configuration
const defaultConfig: ContactFormConfig = {
  method: SubmissionMethod.APPWRITE,
};

// Contact form data type
export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Submit contact form data using the configured method
 * @param data Form data to submit
 * @param config Configuration for submission method
 * @returns Promise with submission result
 */
export async function submitContactForm(
  data: ContactFormData,
  config: Partial<ContactFormConfig> = {}
): Promise<{ success: boolean; id?: string; message: string; error?: any }> {
  // Merge default config with provided config
  const mergedConfig: ContactFormConfig = {
    ...defaultConfig,
    ...config,
  };

  // Log submission attempt
  logger.info('Contact form submission started', {
    method: mergedConfig.method,
    name: data.name,
    email: data.email,
    subject: data.subject,
  });

  try {
    // Validate data against schema
    const validatedData = contactFormSchema.parse(data);

    // Submit using the configured method
    switch (mergedConfig.method) {
      case SubmissionMethod.APPWRITE:
        return await submitToAppwrite(validatedData);

      case SubmissionMethod.API:
        return await submitViaAPI(validatedData, mergedConfig.endpoint);

      case SubmissionMethod.EMAIL:
        return await submitViaEmail(validatedData, mergedConfig.emailAddress);

      default:
        logger.error('Invalid submission method', { method: mergedConfig.method });
        return {
          success: false,
          message: 'Invalid submission method',
        };
    }
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError<Record<string, unknown>>;
      logger.error('Validation error', { error: zodError.issues });
      return {
        success: false,
        message: 'Invalid form data: ' + zodError.issues.map(e => e.message).join(', '),
        error,
      };
    }

    // Handle other errors
    logger.error('Error submitting contact form', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error,
    };
  }
}

/**
 * Submit contact form data via API
 * @param data Validated form data
 * @param endpoint API endpoint
 * @returns Promise with submission result
 */
async function submitViaAPI(
  data: ContactFormData,
  endpoint = '/api/contact-unified'
): Promise<{ success: boolean; id?: string; message: string; error?: any }> {
  try {
    logger.info('Submitting via API', { endpoint });

    // Set a timeout for the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    // Submit to the API endpoint
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        source: 'unified_api',
        method: 'api', // Explicitly set method for the unified API
      }),
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('API error', { status: response.status, error: errorData });
      throw new Error(`API error: ${response.status} ${errorData.message || ''}`);
    }

    // Parse response
    const responseData = await response.json();
    logger.info('API submission successful', { id: responseData.id });

    return {
      success: true,
      id: responseData.id,
      message: responseData.message || 'Form submitted successfully',
    };
  } catch (error) {
    logger.error('Error submitting via API', error);

    // Handle specific error types
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timed out. Please try again.',
        error,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error,
    };
  }
}

/**
 * Submit contact form data via email (mailto link)
 * @param data Validated form data
 * @param emailAddress Recipient email address
 * @returns Promise with submission result
 */
async function submitViaEmail(
  data: ContactFormData,
  emailAddress = 'Jacobsamuelbarkin@gmail.com'
): Promise<{ success: boolean; id?: string; message: string }> {
  try {
    logger.info('Preparing email submission', { emailAddress });

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Cannot open email client from server-side code');
    }

    // Create mailto link
    const subject = encodeURIComponent(`Contact Form: ${data.subject}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
    );
    const mailtoLink = `mailto:${emailAddress}?subject=${subject}&body=${body}`;

    // Open mailto link
    window.location.href = mailtoLink;

    logger.info('Email client opened');

    return {
      success: true,
      message: 'Email client opened. Please send the email to complete your submission.',
    };
  } catch (error) {
    logger.error('Error opening email client', error);

    // Fallback to displaying instructions if email client fails to open
    try {
      // Create a formatted message for manual copying
      const subject = `Contact Form: ${data.subject}`;
      const body = `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`;

      console.log('Please send an email to', emailAddress);
      console.log('Subject:', subject);
      console.log('Body:', body);

      return {
        success: true,
        message: 'Failed to open email client automatically. Please manually send an email to ' + emailAddress + ' with the information you provided.',
      };
    } catch (fallbackError) {
      return {
        success: false,
        message: 'Failed to open email client. Please try again or contact directly via email: ' + emailAddress,
      };
    }
  }
}
