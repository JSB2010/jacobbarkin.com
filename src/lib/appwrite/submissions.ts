// Contact form submissions service
import { Client, Databases, ID, Query, Models } from 'appwrite';
import { createClient } from './client';

// Types
export interface ContactSubmission {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp?: string;
  userAgent?: string;
  source?: string;
  ipAddress?: string;
  // Admin management fields (optional)
  status?: 'new' | 'read' | 'replied' | 'archived';
  priority?: number;
  tags?: string[];
  statusLog?: Array<{
    previousStatus?: string;
    newStatus: string;
    timestamp: string;
    updatedBy: string;
  }>;
  lastUpdated?: string;
}

export interface SubmissionListResponse {
  submissions: ContactSubmission[];
  total: number;
}

/**
 * Service for managing contact form submissions
 */
export class SubmissionsService {
  private client: Client;
  private databases: Databases;
  private databaseId: string;
  private collectionId: string;

  constructor() {
    this.client = createClient();
    this.databases = new Databases(this.client);
    this.databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'contact-form-db';
    this.collectionId = process.env.NEXT_PUBLIC_APPWRITE_CONTACT_COLLECTION_ID || 'contact-submissions';
  }

  /**
   * Get all submissions with pagination and sorting
   * @param limit Number of submissions to fetch
   * @param offset Offset for pagination
   * @param additionalQueries Additional queries for sorting and filtering
   */
  async getSubmissions(
    limit: number = 10,
    offset: number = 0,
    additionalQueries: string[] = []
  ): Promise<SubmissionListResponse> {
    try {
      // Default queries for pagination
      const defaultQueries = [
        Query.limit(limit),
        Query.offset(offset),
        // Default sort by creation date if no additional sort queries provided
        ...(additionalQueries.length > 0 ? [] : [Query.orderDesc('$createdAt')]),
      ];

      // Combine default queries with any additional queries
      const allQueries = [...defaultQueries, ...additionalQueries];

      // Fetch submissions
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        allQueries
      );

      return {
        submissions: response.documents as unknown as ContactSubmission[],
        total: response.total,
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  /**
   * Get a single submission by ID
   * @param id Submission ID
   */
  async getSubmission(id: string): Promise<ContactSubmission> {
    try {
      const submission = await this.databases.getDocument(
        this.databaseId,
        this.collectionId,
        id
      );

      return submission as unknown as ContactSubmission;
    } catch (error) {
      console.error(`Error fetching submission ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a submission
   * @param id Submission ID
   * @param data Data to update
   */
  async updateSubmission(id: string, data: Partial<ContactSubmission>): Promise<ContactSubmission> {
    try {
      const submission = await this.databases.updateDocument(
        this.databaseId,
        this.collectionId,
        id,
        data
      );

      return submission as unknown as ContactSubmission;
    } catch (error) {
      console.error(`Error updating submission ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a submission
   * @param id Submission ID
   */
  async deleteSubmission(id: string): Promise<boolean> {
    try {
      await this.databases.deleteDocument(
        this.databaseId,
        this.collectionId,
        id
      );

      return true;
    } catch (error) {
      console.error(`Error deleting submission ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search submissions
   * @param query Search query
   * @param limit Number of submissions to fetch
   * @param offset Offset for pagination
   * @param additionalQueries Additional queries for sorting and filtering
   */
  async searchSubmissions(
    query: string,
    limit: number = 10,
    offset: number = 0,
    additionalQueries: string[] = []
  ): Promise<SubmissionListResponse> {
    try {
      // Create queries for searching in name, email, subject, and message
      const searchQueries = [
        Query.limit(limit),
        Query.offset(offset),
        // Default sort by creation date if no additional sort queries provided
        ...(additionalQueries.length > 0 ? [] : [Query.orderDesc('$createdAt')]),
      ];

      // Add search queries
      if (query) {
        searchQueries.push(Query.search('name', query));
        searchQueries.push(Query.search('email', query));
        searchQueries.push(Query.search('subject', query));
        searchQueries.push(Query.search('message', query));
      }

      // Add any additional queries (like sorting)
      searchQueries.push(...additionalQueries);

      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        searchQueries
      );

      return {
        submissions: response.documents as unknown as ContactSubmission[],
        total: response.total,
      };
    } catch (error) {
      console.error('Error searching submissions:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const submissionsService = new SubmissionsService();
