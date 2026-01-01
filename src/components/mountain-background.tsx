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
      {/* Background gradients */}
      <div
        className={`fixed inset-0 -z-20 transition-opacity duration-500 pointer-events-none ${
          isDarkMode ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background: "linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)",
        }}
      />
      <div
        className={`fixed inset-0 -z-20 transition-opacity duration-500 pointer-events-none ${
          isDarkMode ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(to bottom, #0f0221 0%, #0c1339 30%, #081c51 70%, #102346 100%)",
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

      {/* Mountain SVG - Redesigned with natural curves */}
      <div className="mountains-container fixed bottom-0 left-0 w-full h-full -z-[5] pointer-events-none overflow-hidden">
        <svg
          className="mountains-svg absolute bottom-0 left-0 w-full h-[35%] md:h-[50%]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
        >
          {/* Far background mountains - gentle rolling hills */}
          <path
            className="mountain-layer mountain-far"
            d="M0,280 Q200,240 360,260 Q520,280 720,240 Q900,220 1080,240 Q1260,260 1440,260 L1440,400 L0,400 Z"
          />

          {/* Background mountains with smooth curves */}
          <path
            className="mountain-layer mountain-bg"
            d="M0,300 Q120,260 240,280 Q360,300 480,240 Q600,180 720,220 Q840,260 960,200 Q1080,140 1200,200 Q1320,260 1440,220 L1440,400 L0,400 Z"
          />

          {/* Snow caps for background mountains - more natural placement */}
          <path
            className="mountain-layer mountain-bg-snow"
            d="M480,240 Q490,235 500,240 Q510,245 520,240 M720,220 Q730,215 740,220 Q750,225 760,220 M960,200 Q970,195 980,200 Q990,205 1000,200 M1200,200 Q1210,195 1220,200 Q1230,205 1240,200"
          />

          {/* Middle mountains - more varied peaks */}
          <path
            className="mountain-layer mountain-middle-1"
            d="M0,320 Q80,300 160,310 Q240,320 320,260 Q400,200 480,240 Q560,280 640,220 Q720,160 800,240 L800,400 L0,400 Z"
          />

          <path
            className="mountain-layer mountain-middle-2"
            d="M640,340 Q720,300 800,320 Q880,340 960,260 Q1040,180 1120,240 Q1200,300 1280,200 Q1360,100 1440,180 L1440,400 L640,400 Z"
          />

          {/* Snow caps for middle mountains */}
          <path
            className="mountain-layer mountain-middle-snow"
            d="M320,260 Q330,255 340,260 Q350,265 360,260 M640,220 Q650,215 660,220 Q670,225 680,220 M960,260 Q970,255 980,260 Q990,265 1000,260 M1280,200 Q1290,195 1300,200 Q1310,205 1320,200"
          />

          {/* Foreground mountains - bold, dramatic curves */}
          <path
            className="mountain-layer mountain-near-1"
            d="M0,360 Q100,340 200,350 Q300,360 400,300 Q500,240 600,320 L600,400 L0,400 Z"
          />

          <path
            className="mountain-layer mountain-near-2"
            d="M400,370 Q500,350 600,360 Q700,370 800,280 Q900,190 1000,300 Q1100,380 1200,320 L1200,400 L400,400 Z"
          />

          <path
            className="mountain-layer mountain-near-3"
            d="M1000,380 Q1100,360 1200,370 Q1300,380 1440,320 L1440,400 L1000,400 Z"
          />

          {/* Snow caps for foreground mountains */}
          <path
            className="mountain-layer mountain-near-snow"
            d="M400,300 Q410,295 420,300 Q430,305 440,300 M800,280 Q810,275 820,280 Q830,285 840,280 M1000,300 Q1010,295 1020,300 Q1030,305 1040,300"
          />

          {/* Foothills - gentle rolling base */}
          <path
            className="mountain-layer forest"
            d="M0,370 Q360,360 720,370 Q1080,380 1440,365 L1440,400 L0,400 Z"
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

        /* Light mode mountain colors - softer, more natural */
        :global(:root:not(.dark)) .mountain-far {
          fill: rgba(186, 230, 253, 0.3);
        }

        :global(:root:not(.dark)) .mountain-bg {
          fill: rgba(125, 211, 252, 0.4);
        }

        :global(:root:not(.dark)) .mountain-bg-snow {
          fill: rgba(255, 255, 255, 0.6);
        }

        :global(:root:not(.dark)) .mountain-middle-1 {
          fill: rgba(56, 189, 248, 0.5);
        }

        :global(:root:not(.dark)) .mountain-middle-2 {
          fill: rgba(14, 165, 233, 0.55);
        }

        :global(:root:not(.dark)) .mountain-middle-snow {
          fill: rgba(255, 255, 255, 0.7);
        }

        :global(:root:not(.dark)) .mountain-near-1 {
          fill: rgba(2, 132, 199, 0.6);
        }

        :global(:root:not(.dark)) .mountain-near-2 {
          fill: rgba(3, 105, 161, 0.65);
        }

        :global(:root:not(.dark)) .mountain-near-3 {
          fill: rgba(7, 89, 133, 0.6);
        }

        :global(:root:not(.dark)) .mountain-near-snow {
          fill: rgba(255, 255, 255, 0.8);
        }

        :global(:root:not(.dark)) .forest {
          fill: rgba(5, 150, 105, 0.35);
        }

        /* Dark mode mountain colors - deeper, more dramatic */
        :global(.dark) .mountain-far {
          fill: rgba(30, 58, 138, 0.4);
        }

        :global(.dark) .mountain-bg {
          fill: rgba(29, 78, 216, 0.45);
        }

        :global(.dark) .mountain-bg-snow {
          fill: rgba(226, 232, 240, 0.3);
        }

        :global(.dark) .mountain-middle-1 {
          fill: rgba(30, 64, 175, 0.5);
        }

        :global(.dark) .mountain-middle-2 {
          fill: rgba(17, 94, 89, 0.55);
        }

        :global(.dark) .mountain-middle-snow {
          fill: rgba(226, 232, 240, 0.4);
        }

        :global(.dark) .mountain-near-1 {
          fill: rgba(15, 118, 110, 0.6);
        }

        :global(.dark) .mountain-near-2 {
          fill: rgba(13, 148, 136, 0.65);
        }

        :global(.dark) .mountain-near-3 {
          fill: rgba(20, 83, 45, 0.6);
        }

        :global(.dark) .mountain-near-snow {
          fill: rgba(226, 232, 240, 0.5);
        }

        :global(.dark) .forest {
          fill: rgba(6, 78, 59, 0.5);
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
