'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function JsonLd() {
  const baseUrl = 'https://jacobbarkin.com';
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Only render the JSON-LD after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Base person schema - enhanced with more details
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Jacob Barkin',
    url: baseUrl,
    sameAs: [
      'https://github.com/JSB2010',
      'https://www.linkedin.com/in/jacob-barkin/',
    ],
    jobTitle: 'Developer & Financial Education Advocate',
    knowsAbout: [
      'Web Development',
      'Financial Education',
      'Accessibility',
      'Public Transportation',
      'Next.js',
      'React',
      'Tailwind CSS',
      'TypeScript',
      'JavaScript',
      'HTML',
      'CSS',
    ],
    image: `${baseUrl}/images/Updated logo.png`,
    description: 'Freshman at Kent Denver School with a focus on computer science, technology, and financial education.',
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Kent Denver School',
      url: 'https://www.kentdenver.org/'
    },
    worksFor: {
      '@type': 'Organization',
      name: 'Ask The Kidz',
      url: 'https://www.askthekidz.com'
    }
  };

  // Website schema - enhanced with more details
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Jacob Barkin Portfolio',
    url: baseUrl,
    description: 'Jacob Barkin - Developer, financial education advocate, and technology enthusiast.',
    author: {
      '@type': 'Person',
      name: 'Jacob Barkin',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    },
    inLanguage: 'en-US',
    copyrightYear: new Date().getFullYear(),
    dateModified: new Date().toISOString(),
    audience: {
      '@type': 'Audience',
      audienceType: 'Developers, Technology Enthusiasts, Educators'
    },
    publisher: {
      '@type': 'Person',
      name: 'Jacob Barkin',
      url: baseUrl
    }
  };

  // Organization schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jacob Barkin',
    url: baseUrl,
    logo: `${baseUrl}/images/Updated logo.png`,
    sameAs: [
      'https://github.com/JSB2010',
      'https://www.linkedin.com/in/jacob-barkin/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${baseUrl}/contact`
    }
  };

  // BreadcrumbList schema - dynamic based on current path
  const getBreadcrumbList = () => {
    if (!pathname) return null;
    const pathSegments = pathname.split('/').filter(Boolean);

    // If we're on the homepage, don't show breadcrumbs
    if (pathSegments.length === 0) return null;

    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      }
    ];

    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Format the segment name to be more readable
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbItems.push({
        '@type': 'ListItem',
        position: index + 2,
        name: name,
        item: `${baseUrl}${currentPath}`
      });
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems
    };
  };

  // WebPage schema - dynamic based on current path
  const getWebPageSchema = () => {
    const pathSegments = (pathname || '').split('/').filter(Boolean);
    let pageType = 'WebPage';
    let pageName = 'Jacob Barkin Portfolio';
    let pageDescription = 'Jacob Barkin - Developer, financial education advocate, and technology enthusiast.';

    // Determine page type based on path
    if (pathSegments.length === 0) {
      pageType = 'WebPage';
      pageName = 'Jacob Barkin | Developer & Technology Consultant';
      pageDescription = 'Jacob Barkin - Developer, technology consultant, and technology enthusiast. Explore my projects, interests, and professional journey.';
    } else if (pathSegments[0] === 'about') {
      pageType = 'ProfilePage';
      pageName = 'About Me | Jacob Barkin';
      pageDescription = 'Learn more about Jacob Barkin, my background, education, and skills in technology and financial education.';
    } else if (pathSegments[0] === 'projects') {
      pageType = 'CollectionPage';
      pageName = 'Projects | Jacob Barkin';
      pageDescription = 'Explore Jacob Barkin\'s projects in technology, technology consulting, and public transportation research.';
    } else if (pathSegments[0] === 'contact') {
      pageType = 'ContactPage';
      pageName = 'Contact | Jacob Barkin';
      pageDescription = 'Get in touch with Jacob Barkin for collaboration, questions, or just to say hello.';
    } else if (pathSegments[0] === 'public-transportation') {
      pageType = 'ArticlePage';
      pageName = 'Public Transportation Research | Jacob Barkin';
      pageDescription = 'Explore my research on public transportation systems in Colorado, focusing on accessibility and sustainability.';
    } else if (pathSegments[0] === 'macbook-pro-opencore') {
      pageType = 'TechArticle';
      pageName = 'MacBook Pro OpenCore Project | Jacob Barkin';
      pageDescription = 'How I revitalized my 2010 MacBook Pro by installing multiple macOS versions (10.7-12.0) using OpenCore bootloader.';
    }

    return {
      '@context': 'https://schema.org',
      '@type': pageType,
      name: pageName,
      description: pageDescription,
      url: `${baseUrl}${pathname}`,
      author: {
        '@type': 'Person',
        name: 'Jacob Barkin'
      },
      publisher: {
        '@type': 'Person',
        name: 'Jacob Barkin',
        url: baseUrl
      },
      inLanguage: 'en-US',
      isPartOf: {
        '@type': 'WebSite',
        url: baseUrl,
        name: 'Jacob Barkin Portfolio'
      },
      datePublished: '2023-09-01T00:00:00Z', // Approximate date
      dateModified: new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}${pathname}`
      }
    };
  };

  // Get the breadcrumb schema
  const breadcrumbSchema = getBreadcrumbList();

  // Get the webpage schema
  const webPageSchema = getWebPageSchema();

  // Only render JSON-LD after component has mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
