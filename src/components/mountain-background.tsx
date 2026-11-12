"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";

// Simple seeded random number generator for consistent star positions
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function MountainBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update theme-color meta tag based on theme
  useEffect(() => {
    if (!mounted) return;
    
    const themeColor = resolvedTheme === "dark" ? "#0f0221" : "#e0f2fe";
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', themeColor);
  }, [mounted, resolvedTheme]);

  // Generate star data once using useMemo with seeded random for consistency
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      left: `${seededRandom(i * 2) * 100}%`,
      top: `${seededRandom(i * 2 + 1) * 100}%`,
      animationDelay: `${seededRandom(i * 3) * 5}s`,
      size: seededRandom(i * 4) > 0.7 ? 3 : 2,
    }));
  }, []);

  // Don't render anything on the server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const isDarkMode = resolvedTheme === "dark";

  return (
    <>
      {/* Background gradients - extend to cover full viewport including safe areas */}
      <div
        className={`fixed inset-0 -z-20 transition-opacity duration-500 pointer-events-none ${
          isDarkMode ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background: "linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)",
          minHeight: "100dvh", // Dynamic viewport height for mobile, falls back to 100vh in older browsers
        }}
      />
      <div
        className={`fixed inset-0 -z-20 transition-opacity duration-500 pointer-events-none ${
          isDarkMode ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(to bottom, #0f0221 0%, #0c1339 30%, #081c51 70%, #102346 100%)",
          minHeight: "100dvh", // Dynamic viewport height for mobile, falls back to 100vh in older browsers
        }}
      />

      {/* Stars for dark mode */}
      {isDarkMode && (
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="stars-container">
            {stars.map((star, i) => (
              <div
                key={i}
                className="star"
                style={{
                  left: star.left,
                  top: star.top,
                  animationDelay: star.animationDelay,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mountain SVG - Redesigned with varied peaks and prominent snow caps */}
      <div className="mountains-container fixed bottom-0 left-0 w-full h-full -z-[5] pointer-events-none overflow-hidden">
        <svg
          className="mountains-svg absolute bottom-0 left-0 w-full h-[35%] md:h-[50%]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
        >
          {/* Far background mountains - gentle rounded hills */}
          <path
            className="mountain-layer mountain-far"
            d="M0,280 Q200,220 360,250 Q520,280 720,210 Q900,180 1080,230 Q1260,260 1440,240 L1440,400 L0,400 Z"
          />

          {/* Background mountains - mix of pointed and rounded */}
          <path
            className="mountain-layer mountain-bg"
            d="M0,300 Q80,270 160,280 Q240,290 320,220 L400,160 L480,220 Q560,260 640,190 Q720,120 800,180 Q880,240 960,150 L1040,100 L1120,150 Q1200,200 1280,180 Q1360,160 1440,200 L1440,400 L0,400 Z"
          />

          {/* Prominent snow caps for background mountains */}
          <path
            className="mountain-layer mountain-bg-snow"
            d="M320,220 L340,200 L360,210 L380,195 L400,160 L420,195 L440,210 L460,200 L480,220 
               M640,190 L660,170 L680,180 L700,165 L720,120 L740,165 L760,180 L780,170 L800,180
               M960,150 L980,135 L1000,145 L1020,125 L1040,100 L1060,125 L1080,145 L1100,135 L1120,150"
          />

          {/* Middle mountains - more dramatic pointed peaks */}
          <path
            className="mountain-layer mountain-middle-1"
            d="M0,330 Q60,310 120,320 Q180,330 240,280 L300,220 L360,260 Q420,300 480,240 L540,180 L600,230 Q660,280 720,250 L720,400 L0,400 Z"
          />

          {/* Middle mountains right - mix of shapes */}
          <path
            className="mountain-layer mountain-middle-2"
            d="M640,350 Q700,330 760,340 Q820,350 880,280 L940,200 L1000,260 Q1060,320 1120,260 L1180,190 L1240,230 Q1300,270 1360,220 L1420,160 L1440,180 L1440,400 L640,400 Z"
          />

          {/* Snow caps for middle mountains */}
          <path
            className="mountain-layer mountain-middle-snow"
            d="M240,280 L260,265 L280,275 L300,220 L320,275 L340,265 L360,260
               M480,240 L500,225 L520,235 L540,180 L560,235 L580,225 L600,230
               M880,280 L900,265 L920,275 L940,200 L960,275 L980,265 L1000,260
               M1120,260 L1140,245 L1160,255 L1180,190 L1200,255 L1220,245 L1240,230"
          />

          {/* Foreground mountains - bold pointed peaks */}
          <path
            className="mountain-layer mountain-near-1"
            d="M0,370 Q50,360 100,365 Q150,370 200,330 L260,270 L320,320 Q380,360 440,340 L500,280 L560,330 Q600,360 600,360 L600,400 L0,400 Z"
          />

          <path
            className="mountain-layer mountain-near-2"
            d="M500,380 Q550,370 600,375 Q650,380 700,330 L760,260 L820,310 Q880,350 940,300 L1000,230 L1060,280 Q1120,320 1180,300 L1200,400 L500,400 Z"
          />

          <path
            className="mountain-layer mountain-near-3"
            d="M1100,380 Q1150,370 1200,375 Q1250,380 1300,340 L1360,280 L1420,320 Q1440,330 1440,330 L1440,400 L1100,400 Z"
          />

          {/* Prominent snow caps for foreground mountains */}
          <path
            className="mountain-layer mountain-near-snow"
            d="M200,330 L220,315 L240,325 L260,270 L280,325 L300,315 L320,320
               M440,340 L460,325 L480,335 L500,280 L520,335 L540,325 L560,330
               M700,330 L720,315 L740,325 L760,260 L780,325 L800,315 L820,310
               M940,300 L960,285 L980,295 L1000,230 L1020,295 L1040,285 L1060,280
               M1300,340 L1320,325 L1340,335 L1360,280 L1380,335 L1400,325 L1420,320"
          />

          {/* Foothills - gentle rolling base */}
          <path
            className="mountain-layer forest"
            d="M0,375 Q360,365 720,375 Q1080,385 1440,370 L1440,400 L0,400 Z"
          />
        </svg>
      </div>

      <style jsx>{`
        .star {
          position: absolute;
          background-color: white;
          border-radius: 50%;
          opacity: 0.7;
          animation: twinkle 5s infinite alternate ease-in-out;
        }

        @keyframes twinkle {
          0% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        /* Light mode mountain colors - more opaque and pronounced */
        :global(:root:not(.dark)) .mountain-far {
          fill: rgba(186, 230, 253, 0.5);
        }

        :global(:root:not(.dark)) .mountain-bg {
          fill: rgba(125, 211, 252, 0.65);
        }

        :global(:root:not(.dark)) .mountain-bg-snow {
          fill: rgba(255, 255, 255, 0.95);
        }

        :global(:root:not(.dark)) .mountain-middle-1 {
          fill: rgba(56, 189, 248, 0.75);
        }

        :global(:root:not(.dark)) .mountain-middle-2 {
          fill: rgba(14, 165, 233, 0.8);
        }

        :global(:root:not(.dark)) .mountain-middle-snow {
          fill: rgba(255, 255, 255, 0.95);
        }

        :global(:root:not(.dark)) .mountain-near-1 {
          fill: rgba(2, 132, 199, 0.85);
        }

        :global(:root:not(.dark)) .mountain-near-2 {
          fill: rgba(3, 105, 161, 0.9);
        }

        :global(:root:not(.dark)) .mountain-near-3 {
          fill: rgba(7, 89, 133, 0.85);
        }

        :global(:root:not(.dark)) .mountain-near-snow {
          fill: rgba(255, 255, 255, 0.98);
        }

        :global(:root:not(.dark)) .forest {
          fill: rgba(5, 150, 105, 0.6);
        }

        /* Dark mode mountain colors - more opaque and pronounced */
        :global(.dark) .mountain-far {
          fill: rgba(30, 58, 138, 0.6);
        }

        :global(.dark) .mountain-bg {
          fill: rgba(29, 78, 216, 0.7);
        }

        :global(.dark) .mountain-bg-snow {
          fill: rgba(226, 232, 240, 0.6);
        }

        :global(.dark) .mountain-middle-1 {
          fill: rgba(30, 64, 175, 0.75);
        }

        :global(.dark) .mountain-middle-2 {
          fill: rgba(17, 94, 89, 0.8);
        }

        :global(.dark) .mountain-middle-snow {
          fill: rgba(226, 232, 240, 0.7);
        }

        :global(.dark) .mountain-near-1 {
          fill: rgba(15, 118, 110, 0.85);
        }

        :global(.dark) .mountain-near-2 {
          fill: rgba(13, 148, 136, 0.9);
        }

        :global(.dark) .mountain-near-3 {
          fill: rgba(20, 83, 45, 0.85);
        }

        :global(.dark) .mountain-near-snow {
          fill: rgba(226, 232, 240, 0.8);
        }

        :global(.dark) .forest {
          fill: rgba(6, 78, 59, 0.75);
        }

        /* Subtle animations for mountains */
        @keyframes mountain-sway-slow {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes mountain-sway-medium {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-4px);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes mountain-sway-subtle {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(2px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .mountain-far {
          animation: mountain-sway-slow 250s ease-in-out infinite;
        }

        .mountain-bg,
        .mountain-bg-snow {
          animation: mountain-sway-slow 220s ease-in-out infinite;
        }

        .mountain-middle-1,
        .mountain-middle-snow {
          animation: mountain-sway-medium 200s ease-in-out infinite;
        }

        .mountain-middle-2 {
          animation: mountain-sway-medium 210s ease-in-out infinite reverse;
        }

        .mountain-near-1 {
          animation: mountain-sway-slow 190s ease-in-out infinite;
        }

        .mountain-near-2,
        .mountain-near-snow {
          animation: mountain-sway-medium 180s ease-in-out infinite reverse;
        }

        .mountain-near-3 {
          animation: mountain-sway-slow 195s ease-in-out infinite;
        }

        .forest {
          animation: mountain-sway-slow 240s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .mountains-svg {
            height: 35%;
          }
        }
      `}</style>
    </>
  );
}
