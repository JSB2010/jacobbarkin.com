/**
 * Submissions API Service
 * 
 * Client-side service for interacting with the submissions API.
 * Uses the D1-backed API endpoints.
 */

// Submission type matching D1 schema
export interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: number;
  created_at: string;
  updated_at: string;
  ip_address: string | null;
  user_agent: string | null;
  source: string;
}

// API response types
interface SubmissionsResponse {
  success: boolean;
  submissions: Submission[];
  total: number;
  limit: number;
  offset: number;
  error?: string;
}

interface SubmissionActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Fetch options
interface FetchSubmissionsOptions {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

/**
 * Fetch submissions from the API
 */
export async function fetchSubmissions(
  options: FetchSubmissionsOptions = {}
): Promise<SubmissionsResponse> {
  const params = new URLSearchParams();
  
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.offset) params.set('offset', options.offset.toString());
  if (options.status) params.set('status', options.status);
  if (options.search) params.set('search', options.search);
  if (options.orderBy) params.set('orderBy', options.orderBy);
  if (options.order) params.set('order', options.order);

  const response = await fetch(`/api/admin/submissions?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Delete a submission
 */
export async function deleteSubmission(id: string): Promise<SubmissionActionResponse> {
  const response = await fetch(`/api/admin/submissions?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Update submission status
 */
export async function updateSubmissionStatus(
  id: string,
  status: 'new' | 'read' | 'replied' | 'archived'
): Promise<SubmissionActionResponse> {
  const response = await fetch(`/api/admin/submissions?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Update submission priority
 */
export async function updateSubmissionPriority(
  id: string,
  priority: number
): Promise<SubmissionActionResponse> {
  const response = await fetch(`/api/admin/submissions?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priority }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Search submissions
 */
export async function searchSubmissions(
  query: string,
  options: Omit<FetchSubmissionsOptions, 'search'> = {}
): Promise<SubmissionsResponse> {
  return fetchSubmissions({ ...options, search: query });
}

