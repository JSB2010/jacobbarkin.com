"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { OptimizedBackgroundImage } from "@/components/ui/optimized-background-image";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { StaticTextCard } from "@/components/ui/aceternity/static-text-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export interface PageHeroProps {
  title: string;
  description: string;
  backgroundImage?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  cta?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
    external?: boolean;
  };
  secondaryCta?: {
    text: string;
    href: string;
    icon?: React.ReactNode;
    external?: boolean;
  };
  tags?: string[];
  className?: string;
  /** Custom actions to render instead of cta/secondaryCta buttons */
  actions?: React.ReactNode;
}

export function PageHero({
  title,
  description,
  backgroundImage = "/images/mountains-bg.jpg",
  badge,
  badgeIcon,
  cta,
  secondaryCta,
  tags,
  className,
  actions,
}: PageHeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate parallax and opacity effects - reduce intensity on mobile
  const parallaxOffset = isMobile ? scrollY * 0.2 : scrollY * 0.4;
  const contentOpacity = Math.max(1 - scrollY / (isMobile ? 300 : 500), 0.2);
  const contentTransform = `translateY(${Math.min(scrollY * (isMobile ? 0.05 : 0.1), isMobile ? 10 : 20)}px)`;

  return (
    <section
      ref={heroRef}
      className={cn(
        "relative py-8 sm:py-12 md:py-16 lg:py-20 overflow-hidden",
        className
      )}
    >
      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${parallaxOffset}px) scale(${1 + scrollY * 0.0005})`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <OptimizedBackgroundImage
          src={backgroundImage}
          alt="Background"
          priority={true}
          overlayClassName="opacity-30 dark:opacity-20 bg-gradient-to-b from-background/0 via-background/0 to-background"
        />
      </div>

      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      {/* Content Container */}
      <div className="container relative z-20">
        <div
          ref={contentRef}
          className="max-w-3xl mx-auto text-center px-4 sm:px-6"
          style={{
            opacity: contentOpacity,
            transform: contentTransform,
            transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
          }}
        >
          {/* Badge (if provided) */}
          {badge && (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mx-auto mb-4 sm:mb-6 backdrop-blur-md">
              {badgeIcon && (
                <span className="relative flex h-2.5 sm:h-3 w-2.5 sm:w-3 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 sm:h-3 w-2.5 sm:w-3 bg-primary"></span>
                </span>
              )}
              <span>{badge}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-0 text-foreground leading-tight">
            {title}
          </h1>

          {/* Decorative Line */}
          <div className="h-1 sm:h-1.5 w-16 sm:w-20 md:w-24 bg-primary rounded-full mx-auto mt-2 sm:mt-3 md:mt-4 mb-2 sm:mb-3 md:mb-4 transition-all duration-500 hover:w-24 sm:hover:w-32"></div>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-3 sm:mb-4 max-w-2xl mx-auto">
            {description}
          </p>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-3 sm:mb-4">
              {tags.slice(0, isMobile ? 3 : tags.length).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary text-xs font-medium backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}
              {isMobile && tags.length > 3 && (
                <span className="px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium backdrop-blur-md">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Custom Actions (if provided) */}
          {actions && (
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {actions}
            </div>
          )}

          {/* Call to Action Buttons (if no custom actions) */}
          {!actions && (cta || secondaryCta) && (
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} gap-2 sm:gap-3 justify-center ${isMobile ? 'w-full max-w-xs mx-auto' : ''}`}>
              {cta && (
                <Button
                  asChild
                  size={isMobile ? "default" : "lg"}
                  className={`group ${isMobile ? 'w-full' : ''}`}
                >
                  <Link
                    href={cta.href}
                    target={cta.external ? "_blank" : undefined}
                    rel={cta.external ? "noopener noreferrer" : undefined}
                  >
                    <span className="truncate">{cta.text}</span>
                    {cta.icon || (
                      <ArrowRight className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
                    )}
                    {cta.external && (
                      <ExternalLink className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    )}
                  </Link>
                </Button>
              )}
              {secondaryCta && (
                <Button
                  asChild
                  variant="outline"
                  size={isMobile ? "default" : "lg"}
                  className={`group ${isMobile ? 'w-full' : ''}`}
                >
                  <Link
                    href={secondaryCta.href}
                    target={secondaryCta.external ? "_blank" : undefined}
                    rel={secondaryCta.external ? "noopener noreferrer" : undefined}
                  >
                    <span className="truncate">{secondaryCta.text}</span>
                    {secondaryCta.icon || (
                      secondaryCta.external ? (
                        <ExternalLink className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      ) : (
                        <ArrowRight className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
                      )
                    )}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
}
