// GitHub API service for fetching repository data

// Define types for GitHub repository data
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
  topics: string[];
  visibility: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

// Transform GitHub repo data to project card format
export interface ProjectCard {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  language: string | null;
  url: string;
  githubUrl: string;
  stars: number;
  forks: number;
  updatedAt: string;
  topics: string[];
  isArchived: boolean;
}

// GitHub API configuration
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_USERNAME = 'JSB2010'; // Your GitHub username

/**
 * Fetch repositories for a GitHub user
 */
export async function fetchUserRepositories(username = GITHUB_USERNAME): Promise<GitHubRepo[]> {
  try {
    // Use Next.js fetch with cache: 'no-store' for SSR or cache: 'force-cache' for static
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    // Add GitHub token if available to increase rate limit
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=100`, {
      headers,
      // For ISR, use next: { revalidate: 3600 } (revalidate every hour)
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();
    return repos;
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return [];
  }
}

/**
 * Transform GitHub repository data to project card format
 */
export function transformRepoToProjectCard(repo: GitHubRepo): ProjectCard {
  // Generate a repository image URL based on the repository data
  const generateRepoImage = (repo: GitHubRepo): string | null => {
    // If the repo has a custom image in topics (e.g., "image:url"), use that
    const imageTopicPrefix = "image:";
    const imageTopic = repo.topics.find(topic => topic.startsWith(imageTopicPrefix));
    if (imageTopic) {
      return imageTopic.substring(imageTopicPrefix.length);
    }

    // For now, return null to use the dynamic image generation in the component
    return null;
  };

  return {
    id: repo.name,
    title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
    description: repo.description,
    image: generateRepoImage(repo),
    language: repo.language,
    url: repo.homepage?.trim() ? repo.homepage : repo.html_url,
    githubUrl: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
    topics: repo.topics,
    isArchived: repo.archived,
  };
}

// Language utilities are imported directly in components that need them
