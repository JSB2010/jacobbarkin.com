import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Code,
  ExternalLink,
  Layers,
  Palette,
  Smartphone,
  Moon,
  Sun,
  Zap
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, SiAppwrite } from "react-icons/si";

// Import Aceternity UI components
import { BackgroundGradient } from "@/components/ui/aceternity/background-gradient";
import { MovingBorder } from "@/components/ui/aceternity/moving-border";
import { TextRevealCard } from "@/components/ui/aceternity/text-reveal-card";

import { BasicImage } from "@/components/ui/basic-image";
import { LazyLoad } from "@/components/ui/lazy-load";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Portfolio Website | Jacob Barkin",
  description: "Learn about the development of my portfolio website built with Next.js, Tailwind CSS, and shadcn UI.",
  alternates: {
    canonical: "https://jacobbarkin.com/portfolio-website",
  },
  openGraph: {
    title: "Portfolio Website | Jacob Barkin",
    description: "Learn about the development of my portfolio website built with Next.js, Tailwind CSS, and shadcn UI.",
    url: "https://jacobbarkin.com/portfolio-website",
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
    title: "Portfolio Website | Jacob Barkin",
    description: "Learn about the development of my portfolio website built with Next.js, Tailwind CSS, and shadcn UI.",
    images: ["/images/Updated logo.png"],
    creator: "@jacobbarkin",
    site: "@jacobbarkin",
  },
};

export default function PortfolioWebsitePage() {
  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Portfolio Website Project"
        description="A modern, responsive portfolio website built with Next.js, Tailwind CSS, and shadcn UI, featuring accessibility and dark mode support."
        backgroundImage="/images/code-bg.jpg"
        tags={["Next.js", "Tailwind CSS", "shadcn UI", "Accessibility"]}
        cta={{
          text: "View Source",
          href: "https://github.com/JSB2010/jacobbarkin.com",
          icon: <FaGithub className="ml-2 h-4 w-4" />,
          external: true
        }}
      />

      {/* Project Overview */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <TextRevealCard
                text="Project Overview"
                revealText="The Journey"
                className="border-none shadow-none p-0 bg-transparent mb-4 sm:mb-6"
              />
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <p>
                  This portfolio website represents my transition from a static HTML/CSS site to a modern web application built with Next.js. The project showcases my skills in front-end development while providing a platform to share my projects and interests.
                </p>
                <p>
                  I designed the site with a focus on accessibility, performance, and user experience. The modern design incorporates responsive layouts, smooth animations, and a thoughtful dark/light mode implementation.
                </p>
                <p>
                  The site features server-side rendering for improved SEO, client-side interactivity for a dynamic user experience, and a component-based architecture for maintainability.
                </p>
              </div>
            </div>
            <BackgroundGradient className="rounded-xl">
              <Card className="border-0 bg-background/80 backdrop-blur-sm overflow-hidden">
                <div className="relative aspect-video">
                  <BasicImage
                    src="/images/portfolio-screenshots/New website screenshot.png"
                    alt="Portfolio Website Screenshot - Next.js Version"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-medium mb-2">Modern Next.js Design</h3>
                  <p className="text-sm text-muted-foreground">
                    Clean, accessible interface with responsive layouts and interactive elements
                  </p>
                </CardContent>
              </Card>
            </BackgroundGradient>
          </div>
        </div>
      </section>

      {/* Evolution from Static Site */}
      <LazyLoad className="bg-muted/50">
        <section className="py-10 sm:py-12 md:py-16">
          <div className="container">
            <TextRevealCard
              text="The Evolution"
              revealText="From Static to Dynamic"
              className="border-none shadow-none p-0 bg-transparent mb-8 sm:mb-10 md:mb-12 mx-auto text-center"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div>
                <BackgroundGradient className="rounded-xl h-full">
                  <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                    <div className="relative aspect-video">
                      <BasicImage
                        src="/images/portfolio-screenshots/Old website screenshot.png"
                        alt="Original Static Website Screenshot"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4 sm:p-6 flex-grow">
                      <h3 className="text-xl font-semibold mb-3">The Original Static Site</h3>
                      <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
                        <p>
                          My portfolio journey began with a traditional static HTML/CSS/JavaScript website. This version was built using:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Vanilla HTML5 for structure</li>
                          <li>CSS3 with multiple stylesheets for different sections</li>
                          <li>JavaScript for interactivity and animations</li>
                          <li>Font Awesome for icons</li>
                          <li>Manual includes for header and footer components</li>
                        </ul>
                        <p>
                          The static site featured a time-based greeting, skill bars with percentage indicators, and basic animations. While functional, it had limitations in terms of maintainability, performance optimization, and component reusability.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </BackgroundGradient>
              </div>

              <div>
                <BackgroundGradient className="rounded-xl h-full">
                  <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                    <div className="relative aspect-video">
                      <iframe
                        src="/static-site-complexity.html"
                        className="w-full h-full border-0"
                        title="Static Site Architecture Complexity"
                      ></iframe>
                    </div>
                    <CardContent className="p-4 sm:p-6 flex-grow">
                      <h3 className="text-xl font-semibold mb-3">Code Complexity & Challenges</h3>
                      <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
                        <p>
                          The original static site accumulated significant complexity that made maintenance increasingly difficult:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Massive CSS files (style.css alone had 6,862 lines)</li>
                          <li>Over 16,600 total lines of code spread across 32+ files</li>
                          <li>Significant code duplication between pages</li>
                          <li>Complex theme system requiring multiple CSS and JS files</li>
                          <li>No component reusability or code organization</li>
                          <li>Performance bottlenecks from large, unoptimized files</li>
                        </ul>
                        <p>
                          This visualization highlights the scale of the codebase and the architectural challenges that led to the decision to transition to a modern framework with better organization and maintainability.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </BackgroundGradient>
              </div>
            </div>

            <div className="mt-8 sm:mt-12">
              <BackgroundGradient className="rounded-xl">
                <Card className="border-0 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-xl font-semibold mb-4">Key Improvements in the Next.js Version</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Structure & Organization</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-muted-foreground">
                          <li>Component-based architecture for better reusability</li>
                          <li>App Router for improved routing and nested layouts</li>
                          <li>TypeScript for type safety and better developer experience</li>
                          <li>Organized project structure with clear separation of concerns</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Styling & Design</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-muted-foreground">
                          <li>Tailwind CSS for utility-first styling approach</li>
                          <li>shadcn UI for consistent, accessible components</li>
                          <li>Improved dark/light mode with system preference detection</li>
                          <li>More sophisticated animations and transitions</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Performance</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-muted-foreground">
                          <li>Server-side rendering for faster initial page loads</li>
                          <li>Image optimization with Next.js Image component</li>
                          <li>Code splitting for reduced bundle sizes</li>
                          <li>Lazy loading for non-critical components</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Developer Experience</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-muted-foreground">
                          <li>Hot module replacement for faster development</li>
                          <li>Better error handling and debugging</li>
                          <li>Simplified deployment process</li>
                          <li>Easier maintenance and feature additions</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </BackgroundGradient>
            </div>
          </div>
        </section>
      </LazyLoad>

      {/* Technologies Used */}
      <LazyLoad className="bg-muted/50">
        <section className="py-10 sm:py-12 md:py-16">
          <div className="container">
            <TextRevealCard
              text="Technologies Used"
              revealText="The Stack"
              className="border-none shadow-none p-0 bg-transparent mb-8 sm:mb-10 md:mb-12 mx-auto text-center"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
              <TechCard
                icon={<SiNextdotjs className="h-8 w-8 sm:h-10 sm:w-10" />}
                title="Next.js"
                description="React framework with server-side rendering and routing"
              />
              <TechCard
                icon={<SiReact className="h-8 w-8 sm:h-10 sm:w-10" />}
                title="React"
                description="Component-based UI library for interactive interfaces"
              />
              <TechCard
                icon={<SiTailwindcss className="h-8 w-8 sm:h-10 sm:w-10" />}
                title="Tailwind CSS"
                description="Utility-first CSS framework for rapid styling"
              />
              <TechCard
                icon={<SiTypescript className="h-8 w-8 sm:h-10 sm:w-10" />}
                title="TypeScript"
                description="Typed JavaScript for improved code quality"
              />
              <TechCard
                icon={<SiAppwrite className="h-8 w-8 sm:h-10 sm:w-10" />}
                title="Appwrite"
                description="Backend services for contact form and data storage"
              />
            </div>
          </div>
        </section>
      </LazyLoad>

      {/* Key Features */}
      <LazyLoad>
        <section className="py-10 sm:py-12 md:py-16">
          <div className="container">
            <TextRevealCard
              text="Key Features"
              revealText="What Makes It Special"
              className="border-none shadow-none p-0 bg-transparent mb-8 sm:mb-10 md:mb-12 mx-auto text-center"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard
                icon={<Smartphone className="h-6 w-6" />}
                title="Responsive Design"
                description="Optimized for all devices from mobile phones to large desktop screens"
              />
              <FeatureCard
                icon={<Code className="h-6 w-6" />}
                title="Modern Architecture"
                description="Built with Next.js App Router and React Server Components"
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Performance Optimized"
                description="Fast loading times with optimized images and code splitting"
              />
              <FeatureCard
                icon={<Layers className="h-6 w-6" />}
                title="Component Library"
                description="Leveraging shadcn UI for consistent, accessible components"
              />
              <FeatureCard
                icon={<div className="flex">
                  <Moon className="h-6 w-6" />
                  <Sun className="h-6 w-6 ml-1" />
                </div>}
                title="Dark/Light Mode"
                description="Theme switching with system preference detection"
              />
              <FeatureCard
                icon={<Palette className="h-6 w-6" />}
                title="Custom Animations"
                description="Subtle, performant animations enhance the user experience"
              />
            </div>
          </div>
        </section>
      </LazyLoad>

      {/* Development Process */}
      <LazyLoad className="bg-muted/50">
        <section className="py-10 sm:py-12 md:py-16">
          <div className="container">
            <TextRevealCard
              text="Development Process"
              revealText="The Journey"
              className="border-none shadow-none p-0 bg-transparent mb-8 sm:mb-10 md:mb-12 mx-auto text-center"
            />

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Static Site Challenges</h3>
                  <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
                    <p>
                      The original static site served its purpose but presented several challenges as it grew:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>File Organization:</strong> With over 30 separate files (HTML, CSS, JS) for a relatively simple site, organization became unwieldy.
                      </li>
                      <li>
                        <strong>Code Duplication:</strong> Header and footer had to be manually included on each page using JavaScript, leading to potential inconsistencies.
                      </li>
                      <li>
                        <strong>Theme Implementation:</strong> The dark/light theme system required complex JavaScript and multiple CSS overrides.
                      </li>
                      <li>
                        <strong>Performance:</strong> Large JavaScript files and unoptimized images affected load times, especially on mobile devices.
                      </li>
                      <li>
                        <strong>Maintainability:</strong> Adding new features or pages required touching multiple files and ensuring consistency across the site.
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Transition Decision</h3>
                  <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
                    <p>
                      After researching modern web development frameworks, I chose Next.js for the redesign because:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>React-Based:</strong> Component-based architecture would solve the code duplication issues.
                      </li>
                      <li>
                        <strong>Built-in Routing:</strong> The App Router would simplify navigation and page organization.
                      </li>
                      <li>
                        <strong>Server Components:</strong> Would improve performance and SEO without sacrificing interactivity.
                      </li>
                      <li>
                        <strong>Image Optimization:</strong> Automatic image optimization would improve load times.
                      </li>
                      <li>
                        <strong>TypeScript Support:</strong> Would add type safety and improve code quality.
                      </li>
                      <li>
                        <strong>Modern Ecosystem:</strong> Access to libraries like Tailwind CSS and shadcn UI would speed up development.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-6 sm:space-y-8">
                <ProcessStep
                  number="01"
                  title="Analysis & Planning"
                  description="Analyzed the existing static site to identify strengths to keep and weaknesses to address. Created a detailed plan for the transition, including component structure, routing, and styling approach."
                />
                <ProcessStep
                  number="02"
                  title="Environment Setup"
                  description="Set up a Next.js project with TypeScript, Tailwind CSS, and shadcn UI. Configured ESLint and Prettier for code quality. Established the project structure following Next.js best practices."
                />
                <ProcessStep
                  number="03"
                  title="Component Architecture"
                  description="Designed a component-based architecture, breaking down the UI into reusable pieces. Created base components like cards, buttons, and navigation elements that could be composed into larger features."
                />
                <ProcessStep
                  number="04"
                  title="Theme System Implementation"
                  description="Implemented a robust theme system using CSS variables and context API. Created a seamless dark/light mode toggle with system preference detection and persistent user choice."
                />
                <ProcessStep
                  number="05"
                  title="Content Migration"
                  description="Migrated content from the static site to the Next.js application, restructuring it to fit the new component model. Enhanced content with improved typography and layout."
                />
                <ProcessStep
                  number="06"
                  title="Advanced Features"
                  description="Added advanced features like animations, transitions, and interactive elements using React hooks and modern CSS techniques. Implemented lazy loading for non-critical components."
                />
                <ProcessStep
                  number="07"
                  title="Performance Optimization"
                  description="Optimized performance through image compression, code splitting, and efficient rendering strategies. Used Lighthouse and Web Vitals to measure and improve core metrics."
                />
                <ProcessStep
                  number="08"
                  title="Testing & Refinement"
                  description="Tested the site across different devices and browsers to ensure compatibility. Refined the design and functionality based on feedback and performance metrics."
                />
                <ProcessStep
                  number="09"
                  title="Deployment"
                  description="Deployed the site to Cloudflare Pages with GitHub integration for continuous deployment. Set up environment variables and build configurations for optimal production performance."
                />
              </div>
            </div>
          </div>
        </section>
      </LazyLoad>

      {/* Conclusion */}
      <LazyLoad>
        <section className="py-10 sm:py-12 md:py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <TextRevealCard
                text="Lessons Learned"
                revealText="Key Takeaways"
                className="border-none shadow-none p-0 bg-transparent mb-8 sm:mb-10 mx-auto text-center"
              />

              <div className="space-y-6 sm:space-y-8 text-muted-foreground">
                <p>
                  The journey from a static HTML/CSS/JavaScript site to a modern Next.js application taught me valuable lessons about web development:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <BackgroundGradient className="rounded-xl h-full">
                    <Card className="border-0 bg-background/80 backdrop-blur-sm h-full">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-lg font-medium mb-3 text-foreground">Technical Growth</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                          <li>Component-based architecture significantly improves code organization and reusability</li>
                          <li>TypeScript catches errors early and improves code quality</li>
                          <li>Modern frameworks like Next.js solve many common web development challenges</li>
                          <li>Performance optimization requires a holistic approach across code, assets, and delivery</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </BackgroundGradient>

                  <BackgroundGradient className="rounded-xl h-full">
                    <Card className="border-0 bg-background/80 backdrop-blur-sm h-full">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-lg font-medium mb-3 text-foreground">Design & UX Insights</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                          <li>Accessibility should be built-in from the start, not added later</li>
                          <li>Responsive design requires testing on actual devices, not just browser resizing</li>
                          <li>Dark mode implementation is more complex than just inverting colors</li>
                          <li>Animation and interactivity should enhance the experience, not distract from it</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </BackgroundGradient>
                </div>

                <p>
                  The most significant lesson was the value of planning and architecture. Taking the time to properly design the component structure and data flow before implementation saved countless hours of refactoring later. The transition from static to dynamic wasn&apos;t just about using new technologies—it was about adopting a new mindset focused on modularity, reusability, and user experience.
                </p>

                <p>
                  This project also highlighted the importance of continuous learning in web development. The field evolves rapidly, and staying current with best practices and new technologies is essential for creating modern, performant websites.
                </p>

                <div className="mt-8 text-center">
                  <p className="mb-4 font-medium">Interested in the technical details?</p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="https://github.com/JSB2010/jacobbarkin.com" target="_blank" rel="noopener noreferrer">
                      <Button className="gap-2">
                        <FaGithub className="h-4 w-4" />
                        View Source Code
                      </Button>
                    </Link>
                    <Link href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Next.js Documentation
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazyLoad>
    </>
  );
}

function TechCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <BackgroundGradient className="rounded-xl h-full">
      <Card className="border-0 bg-background/80 backdrop-blur-sm h-full">
        <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
          <MovingBorder className="p-0.5 mb-4" containerClassName="rounded-full">
            <div className="p-3 sm:p-4 rounded-full bg-background text-primary flex items-center justify-center">
              {icon}
            </div>
          </MovingBorder>
          <h3 className="text-base sm:text-lg font-medium mb-2">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </BackgroundGradient>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 text-primary">{icon}</div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProcessStep({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-4 sm:gap-6">
      <div className="flex-shrink-0">
        <MovingBorder className="p-0.5" containerClassName="rounded-full">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background flex items-center justify-center text-primary font-bold">
            {number}
          </div>
        </MovingBorder>
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-medium mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
