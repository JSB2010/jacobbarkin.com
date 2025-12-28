import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";

import Header from "@/components/header";
import Footer from "@/components/footer";
import JsonLd from "@/components/json-ld";
import { MountainBackground } from "@/components/mountain-background";

const clerkPublishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "";

// Check if Clerk is properly configured
const isClerkConfigured = !!(
  clerkPublishableKey &&
  clerkPublishableKey !== "pk_test_your_publishable_key" &&
  clerkPublishableKey.startsWith("pk_")
);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#3b82f6",
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  title: {
    default: "Jacob Barkin | Developer & Technology Consultant",
    template: "%s | Jacob Barkin"
  },
  description: "Jacob Barkin - Developer, technology consultant, and technology enthusiast. Explore my projects, interests, and professional journey.",
  keywords: ["Jacob Barkin", "Developer", "Technology Consulting", "Web Development", "Next.js", "Portfolio", "Technology", "Accessibility", "Public Transportation Research", "High School Student", "Kent Denver School", "Financial Education"],
  authors: [{ name: "Jacob Barkin", url: "https://github.com/JSB2010" }],
  creator: "Jacob Barkin",
  publisher: "Jacob Barkin",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  metadataBase: new URL("https://jacobbarkin.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/Updated logo.png" }
    ],
    shortcut: "/images/Updated logo.png",
    apple: "/images/Updated logo.png",
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
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacob Barkin | Developer & Technology Consultant",
    description: "Developer, technology consultant, and technology enthusiast. Explore my projects, interests, and professional journey.",
    images: ["/images/Updated logo.png"],
    creator: "@jacobbarkin",
    site: "@jacobbarkin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "verification_token",
  },
  category: "technology",
  applicationName: "Jacob Barkin Portfolio",
  referrer: "origin-when-cross-origin",
};

function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="jacob-barkin-theme"
        >
          <MountainBackground />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
            <Footer />
          </div>
          <JsonLd />
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // If Clerk is not configured, render without it
  if (!isClerkConfigured) {
    console.warn("Clerk is not configured. Authentication features will be disabled.");
    return <AppContent>{children}</AppContent>;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AppContent>{children}</AppContent>
    </ClerkProvider>
  );
}
