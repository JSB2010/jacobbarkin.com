"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { FaGithub } from "react-icons/fa6";
import {
  getLanguageColor,
  getLanguageImagePath,
  getLanguageLabel,
  getLanguageSoftColor,
} from "@/lib/languages";

// Generate a unique hash from a string
export function generateHashFromString(str: string): number {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// GitHub project thumbnail component
export function GitHubProjectThumbnail({
  language,
  title,
  className
}: {
  language: string | null;
  title: string;
  className?: string;
}) {
  // Generate a unique but consistent hash for this repository
  const repoNameHash = generateHashFromString(title);
  const languageColor = getLanguageColor(language);
  const languageSoftColor = getLanguageSoftColor(language);
  const languageLabel = getLanguageLabel(language);

  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center overflow-hidden",
        className
      )}
      style={{
        background:
          `linear-gradient(135deg, ${languageSoftColor}, rgba(var(--primary-rgb), 0.08)), ` +
          `radial-gradient(circle at 18% 18%, ${languageColor}24, transparent 32%)`,
      }}
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-15 text-foreground/40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${repoNameHash}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${repoNameHash})`} />
        </svg>
      </div>

      {/* Main language logo */}
      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/60 bg-white/85 p-4 shadow-lg shadow-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-background/75 md:h-28 md:w-28">
        <Image
          src={getLanguageImagePath(language)}
          alt={`${languageLabel} logo`}
          width={72}
          height={72}
          className="h-full w-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `/images/languages/patterns/geometric-pattern.svg`;
          }}
        />
      </div>

      {/* GitHub icon overlay in top right */}
      <div className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 shadow-sm backdrop-blur-sm dark:bg-black/60">
        <FaGithub className="h-4 w-4 text-white" />
      </div>

      {/* Language indicator in bottom left */}
      {language && (
        <div className="absolute bottom-4 left-4 z-10 rounded-md border border-white/60 bg-background/85 px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-background/70">
          {languageLabel}
        </div>
      )}
    </div>
  );
}
