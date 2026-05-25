import { MetadataRoute } from 'next';

// Add static export configuration
export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate once per day

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jacobbarkin.com';

  // Define all routes in your application with their metadata
  const routes = [
    {
      path: '',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      path: '/about',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      path: '/projects',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      path: '/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      path: '/privacy',
      lastModified: new Date('2026-05-25'),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      path: '/public-transportation',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      path: '/macbook-pro-opencore',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      path: '/macos-apple-tv',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      path: '/portfolio-website',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      path: '/raspberry-pi-homelab',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Project-specific pages could be dynamically added here if needed
  // For example, if you have a database of projects, you could fetch them
  // and add them to the routes array

  // Generate sitemap entries
  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
