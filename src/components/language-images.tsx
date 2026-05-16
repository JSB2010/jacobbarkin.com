"use client";

import Image from "next/image";
import { useState } from "react";
import { getLanguageConfig, getLanguageSoftColor } from "@/lib/languages";

// Fallback patterns for languages without images
const fallbackPatterns = [
  "geometric-pattern.svg",
  "wave-pattern.svg",
  "grid-pattern.svg",
  "tech-pattern.svg",
  "diagonal-pattern.svg",
];

// Default background for fallback patterns - with dark mode support
const defaultBgColor = "linear-gradient(135deg, var(--primary-rgb, 59, 130, 246, 0.1), var(--primary-rgb, 59, 130, 246, 0.3))";

interface LanguageImageProps {
  language: string | null;
  seed?: number;
  className?: string;
}

export function LanguageImage({ language, seed = 0, className = "" }: Readonly<LanguageImageProps>) {
  const [imageError, setImageError] = useState(false);

  // If no language or error loading image, use a fallback pattern
  if (!language || imageError) {
    // Use the seed to select a consistent fallback pattern
    const patternIndex = seed % fallbackPatterns.length;
    const fallbackImage = `/images/languages/patterns/${fallbackPatterns[patternIndex]}`;

    return (
      <div
        className={`relative w-full h-full ${className}`}
        style={{ background: defaultBgColor }}
      >
        <Image
          src={fallbackImage}
          alt="Programming language pattern"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  // Check if we have a configuration for this language
  const languageConfig = getLanguageConfig(language);

  // If we don't have a specific configuration, use a fallback pattern
  if (!languageConfig) {
    // Use the seed to select a consistent fallback pattern
    const patternIndex = seed % fallbackPatterns.length;
    const fallbackImage = `/images/languages/patterns/${fallbackPatterns[patternIndex]}`;

    return (
      <div
        className={`relative w-full h-full ${className}`}
        style={{ background: defaultBgColor }}
      >
        <Image
          src={fallbackImage}
          alt={`${language} pattern`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  // Return the language-specific image with matching background
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      style={{
        background: `linear-gradient(135deg, ${getLanguageSoftColor(language)}, transparent 72%)`,
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <Image
          src={languageConfig.imagePath}
          alt={`${language} logo`}
          fill
          className="object-contain p-8"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />
      </div>
    </div>
  );
}
