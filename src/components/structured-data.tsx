'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

interface StructuredDataProps {
  title?: string;
  description?: string;
  type?: 'WebSite' | 'WebPage' | 'Person' | 'Project' | 'Article';
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

export function StructuredData({
  title = 'Jacob Barkin',
  description = 'Developer and Technology Consultant',
  type = 'WebPage',
  image = 'https://jacobbarkin.com/images/profile.jpg',
  datePublished,
  dateModified
}: StructuredDataProps) {
  const pathname = usePathname();
  const url = `https://jacobbarkin.com${pathname}`;
  
  // Base structured data
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    description: description,
    url: url,
    ...(image && { image }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified: dateModified || datePublished }),
  };

  // Additional data based on type
  // Use Record type to allow additional properties
  let structuredData: Record<string, unknown> = { ...baseData };
  
  if (type === 'Person') {
    structuredData = {
      ...baseData,
      sameAs: [
        'https://github.com/JSB2010',
        'https://www.linkedin.com/in/jacob-barkin-b9a9b7291/'
      ],
      knowsAbout: [
        'Web Development',
        'React',
        'Next.js',
        'JavaScript',
        'TypeScript',
        'Public Transportation',
        'Running',
        'Skiing'
      ],
      alumniOf: {
        '@type': 'HighSchool',
        name: 'Kent Denver School',
        sameAs: 'https://www.kentdenver.org/'
      }
    };
  } else if (type === 'Project' || type === 'Article') {
    structuredData = {
      ...baseData,
      author: {
        '@type': 'Person',
        name: 'Jacob Barkin',
        url: 'https://jacobbarkin.com'
      },
      publisher: {
        '@type': 'Person',
        name: 'Jacob Barkin',
        url: 'https://jacobbarkin.com'
      }
    };
  } else if (pathname === '/' && type === 'WebSite') {
    structuredData = {
      ...baseData,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://jacobbarkin.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    };
  }

  return (
    <Script id="structured-data" type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  );
}
