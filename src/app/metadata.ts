import { Metadata } from 'next';

// Enhanced metadata for the home page
export const metadata: Metadata = {
  title: "Jacob Barkin | Developer & Technology Consultant",
  description: "Jacob Barkin - Developer, technology consultant, and technology enthusiast. Explore my projects, interests, and professional journey at Kent Denver School.",
  keywords: [
    "Jacob Barkin", 
    "Developer", 
    "Technology Consultant", 
    "Web Development", 
    "Next.js", 
    "Portfolio", 
    "Technology", 
    "Accessibility", 
    "Public Transportation Research",
    "Kent Denver School",
    "Financial Education",
    "High School Student",
    "Colorado Developer"
  ],
  alternates: {
    canonical: "https://jacobbarkin.com",
    languages: {
      'en-US': 'https://jacobbarkin.com',
    },
  },
  openGraph: {
    title: "Jacob Barkin | Developer & Technology Consultant",
    description: "Developer, technology consultant, and technology enthusiast. Explore my projects, interests, and professional journey.",
    url: "https://jacobbarkin.com",
    siteName: "Jacob Barkin Portfolio",
    images: [
      {
        url: "/images/Updated logo.png",
        width: 800,
        height: 600,
        alt: "Jacob Barkin Logo",
      },
      {
        url: "/images/Jacob Boreas.jpeg",
        width: 1200,
        height: 630,
        alt: "Jacob Barkin Profile",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacob Barkin | Developer & Technology Consultant",
    description: "Developer, technology consultant, and technology enthusiast. Explore my projects, interests, and professional journey.",
    images: ["/images/Jacob Boreas.jpeg"],
    creator: "@jacobbarkin",
    site: "@jacobbarkin",
  },
};
