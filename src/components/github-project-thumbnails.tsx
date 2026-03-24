"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MovingBorder } from "@/components/ui/aceternity/moving-border";
import { FaGithub } from "react-icons/fa6";
import { LanguageImage } from "@/components/language-images";

// Generate a unique hash from a string
export function generateHashFromString(str: string): number {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// Function to get a color based on a seed
export function getColorFromSeed(seed: number): string {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#8B5CF6", // purple
    "#F59E0B", // amber
    "#EF4444", // red
    "#EC4899", // pink
    "#6366F1", // indigo
    "#14B8A6", // teal
    "#F97316", // orange
    "#8B5CF6", // violet
    "#06B6D4", // cyan
    "#84CC16", // lime
  ];

  return colors[seed % colors.length];
}

// Function to get a gradient based on a seed
export function getGradientFromSeed(seed: number): string {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-green-500 to-emerald-600",
    "from-purple-500 to-violet-600",
    "from-amber-500 to-orange-600",
    "from-red-500 to-rose-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-teal-500 to-cyan-600",
    "from-orange-500 to-amber-600",
    "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600",
    "from-lime-500 to-green-600",
  ];

  return gradients[seed % gradients.length];
}

// Function to get the correct image path for a language
function getLanguageImagePath(language: string | null): string {
  if (!language) return '/images/languages/javascript.svg';

  // Handle special cases
  const languageMap: Record<string, string> = {
    "C++": "cpp",
    "C#": "csharp",
    "JavaScript": "javascript",
    "TypeScript": "typescript",
    "Python": "python",
    "Java": "java",
    "Go": "go",
    "Ruby": "ruby",
    "PHP": "php",
    "Swift": "swift",
    "Kotlin": "kotlin",
    "Rust": "rust",
    "C": "c",
    "HTML": "html",
    "CSS": "css",
    "Shell": "shell",
    "Dart": "dart",
    "R": "r"
  };

  const normalizedLanguage = language.toLowerCase();
  const mappedLanguage = languageMap[language] || normalizedLanguage;

  return `/images/languages/${mappedLanguage}.svg`;
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

  // Get gradient based on the hash
  const gradient = getGradientFromSeed(repoNameHash);

  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Background with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-20`} />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${repoNameHash}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${repoNameHash})`} />
        </svg>
      </div>

      {/* Main language logo */}
      <div className="relative z-10 w-24 h-24 md:w-28 md:h-28">
        <MovingBorder className="p-0.5" containerClassName="rounded-full" duration={6000}>
          <div className="rounded-full bg-white dark:bg-gray-800 backdrop-blur-sm border border-primary/20 flex items-center justify-center overflow-hidden">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center p-2">
              <Image
                src={getLanguageImagePath(language)}
                alt={`${language || 'Programming'} logo`}
                width={64}
                height={64}
                className="object-contain"
                onError={(e) => {
                  // Fallback to a pattern if the image fails to load
                  const target = e.target as HTMLImageElement;
                  const patternIndex = repoNameHash % 5;
                  target.src = `/images/languages/patterns/geometric-pattern.svg`;
                }}
              />
            </div>
          </div>
        </MovingBorder>
      </div>

      {/* GitHub icon overlay in top right */}
      <div className="absolute top-4 right-4 bg-black/40 dark:bg-black/60 p-2 rounded-full backdrop-blur-sm shadow-sm z-10">
        <FaGithub className="h-4 w-4 text-white" />
      </div>

      {/* Language indicator in bottom left */}
      {language && (
        <div className="absolute bottom-4 left-4 bg-background/80 dark:bg-background/60 px-2 py-1 rounded-md backdrop-blur-sm shadow-sm z-10 text-xs font-medium border border-primary/20">
          {language}
        </div>
      )}
    </div>
  );
}

