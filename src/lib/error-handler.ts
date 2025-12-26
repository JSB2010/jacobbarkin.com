/**
 * Centralized Error Handling System
 * 
 * This module provides a standardized way to handle errors across the application.
 * It includes:
 * - Custom error classes for different types of errors
 * - Error formatting utilities
 * - Error reporting functions
 * - Integration with the logging system
 */

import { logger } from '@/lib/logger';

// Base application error class
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code = 'INTERNAL_ERROR',
    statusCode = 500,
    isOperational = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NOT_FOUND', 404, true, context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, true, context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', 500, true, context);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 502, true, context);
  }
}

// Error handler function for API routes
export function handleApiError(error: unknown) {
  // If it's already an AppError, use it directly
  if (error instanceof AppError) {
    logger.error(`API Error: ${error.code}`, {
      message: error.message,
      statusCode: error.statusCode,
      context: error.context
    });

    return {
      success: false,
      error: error.code,
      message: error.message,
      statusCode: error.statusCode
    };
  }

  // Handle standard errors
  if (error instanceof Error) {
    logger.error('Unhandled API Error', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message,
      statusCode: 500
    };
  }

  // Handle unknown errors
  logger.error('Unknown API Error', { error });
  
  return {
    success: false,
    error: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500
  };
}

// Function to format user-friendly error messages
export function formatUserErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Clean up error message for user display
    return error.message
      .replace(/^Error: /, '')
      .replace(/^API error: /, '');
  }

  return 'An unexpected error occurred. Please try again later.';
}

// Function to determine if an error should be reported to the user
export function shouldReportErrorToUser(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  
  return true;
}

// Function to create an error from an HTTP response
export async function createErrorFromResponse(response: Response): Promise<AppError> {
  try {
    const data = await response.json();
    
    switch (response.status) {
      case 400:
        return new ValidationError(data.message || 'Invalid request', data);
      case 401:
        return new AuthenticationError(data.message || 'Authentication required', data);
      case 403:
        return new AuthorizationError(data.message || 'Not authorized', data);
      case 404:
        return new NotFoundError(data.message || 'Resource not found', data);
      case 429:
        return new RateLimitError(data.message || 'Rate limit exceeded', data);
      default:
        return new AppError(
          data.message || 'An error occurred',
          data.error || 'API_ERROR',
          response.status,
          true,
          data
        );
    }
  } catch (error) {
    // If we can't parse the JSON, create a generic error
    return new AppError(
      `API error: ${response.status} ${response.statusText}`,
      'API_ERROR',
      response.status
    );
  }
}