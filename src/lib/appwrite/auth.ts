// Appwrite authentication service
import { Client, Account, ID } from 'appwrite';
import { createClient } from './client';

// Types
export interface AuthUser {
  $id: string;
  email: string;
  name?: string;
  emailVerification: boolean;
  status: boolean;
}

// Error types
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  USER_NOT_FOUND = 'user_not_found',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: any;
}

/**
 * Authentication service for Appwrite
 * Simplified and reliable authentication without complex session management
 */
export class AuthService {
  private client: Client;
  private account: Account;

  constructor() {
    this.client = createClient();
    this.account = new Account(this.client);
  }

  /**
   * Create a new account
   * @param email Email address
   * @param password Password
   * @param name Optional name
   */
  async createAccount(email: string, password: string, name?: string): Promise<AuthUser | AuthError> {
    try {
      const user = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );

      return this.mapUser(user);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Sign in with email and password
   * @param email Email address
   * @param password Password
   */
  async signIn(email: string, password: string): Promise<AuthUser | AuthError> {
    try {
      // Create session
      await this.account.createEmailPasswordSession(email, password);

      // Get user data
      const user = await this.account.get();

      return this.mapUser(user);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<boolean> {
    try {
      // Delete current session
      await this.account.deleteSession('current');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      // Return true anyway to allow cleanup on client side
      return true;
    }
  }

  /**
   * Get the current user
   * Returns null if not authenticated
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await this.account.get();
      return this.mapUser(user);
    } catch (error) {
      // Not authenticated or session expired
      return null;
    }
  }

  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.account.get();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Map Appwrite user to AuthUser
   */
  private mapUser(user: any): AuthUser {
    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
      emailVerification: user.emailVerification,
      status: user.status,
    };
  }

  /**
   * Handle authentication errors
   */
  private handleError(error: any): AuthError {
    console.error('Auth error:', error);

    if (error.code === 401) {
      return {
        type: AuthErrorType.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
        originalError: error,
      };
    }

    if (error.code === 404) {
      return {
        type: AuthErrorType.USER_NOT_FOUND,
        message: 'User not found',
        originalError: error,
      };
    }

    if (error.code === 409) {
      return {
        type: AuthErrorType.EMAIL_ALREADY_EXISTS,
        message: 'Email already exists',
        originalError: error,
      };
    }

    if (error.code === 0 || error.message?.includes('network')) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your connection and try again.',
        originalError: error,
      };
    }

    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      message: error.message || 'An unknown error occurred',
      originalError: error,
    };
  }
}

// Create a singleton instance
export const authService = new AuthService();
