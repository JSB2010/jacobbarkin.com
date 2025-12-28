"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function MountainBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
            {Array.from({ length: 150 }).map((_, i) => (
              <div
                key={i}
                className="star"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  width: Math.random() > 0.7 ? "3px" : "2px",
                  height: Math.random() > 0.7 ? "3px" : "2px",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mountain SVG */}
      <div className="mountains-container fixed bottom-0 left-0 w-full h-full -z-[5] pointer-events-none overflow-hidden">
        <svg
          className="mountains-svg absolute bottom-0 left-0 w-full h-[60%] md:h-[60%]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          {/* Background mountains (farthest) */}
          <path
            className="mountain-layer mountain-bg"
            d="M0,190 L120,170 L240,140 L360,170 L480,130 L600,160 L720,120 L840,150 L960,110 L1080,140 L1200,100 L1320,130 L1440,110 L1440,320 L0,320 Z"
          />

          {/* Snow caps for background mountains */}
          <path
            className="mountain-layer mountain-bg-snow"
            d="M480,130 L500,140 L480,135 L460,140 Z M720,120 L740,130 L720,125 L700,130 Z M960,110 L980,120 L960,115 L940,120 Z M1200,100 L1220,110 L1200,105 L1180,110 Z"
          />

          {/* Middle mountain range - left side */}
          <path
            className="mountain-layer mountain-middle-1"
            d="M0,220 L80,210 L160,180 L200,200 L240,170 L280,190 L320,160 L360,180 L400,150 L440,170 L480,140 L520,160 L560,130 L600,150 L640,120 L680,140 L720,210 L720,320 L0,320 Z"
          />

          {/* Snow caps for left middle mountain */}
          <path
            className="mountain-layer mountain-middle-snow-1"
            d="M320,160 L330,170 L320,165 L310,170 Z M480,140 L490,150 L480,145 L470,150 Z M640,120 L650,130 L640,125 L630,130 Z"
          />

          {/* Middle mountain range - right side */}
          <path
            className="mountain-layer mountain-middle-2"
            d="M680,200 L720,180 L760,150 L800,170 L840,130 L880,150 L920,110 L960,130 L1000,100 L1040,120 L1080,90 L1120,110 L1160,80 L1200,100 L1240,70 L1280,90 L1320,60 L1360,80 L1400,50 L1440,70 L1440,320 L680,320 Z"
          />

          {/* Snow caps for right middle mountain */}
          <path
            className="mountain-layer mountain-middle-snow-2"
            d="M840,130 L850,140 L840,135 L830,140 Z M920,110 L930,120 L920,115 L910,120 Z M1000,100 L1010,110 L1000,105 L990,110 Z M1080,90 L1090,100 L1080,95 L1070,100 Z M1160,80 L1170,90 L1160,85 L1150,90 Z M1240,70 L1250,80 L1240,75 L1230,80 Z M1320,60 L1330,70 L1320,65 L1310,70 Z M1400,50 L1410,60 L1400,55 L1390,60 Z"
          />

          {/* Foreground mountains - left */}
          <path
            className="mountain-layer mountain-near-1"
            d="M0,260 L60,250 L120,230 L180,245 L240,220 L300,240 L360,210 L420,230 L480,260 L480,320 L0,320 Z"
          />

          {/* Foreground mountains - middle */}
          <path
            className="mountain-layer mountain-near-2"
            d="M440,250 L480,240 L520,220 L560,235 L600,180 L640,230 L680,210 L720,225 L760,205 L800,220 L840,240 L880,250 L880,320 L440,320 Z"
          />

          {/* Snow cap for sharp peak */}
          <path
            className="mountain-layer mountain-near-snow-2"
            d="M600,180 L610,190 L600,185 L590,190 Z"
          />

          {/* Foreground mountains - right */}
          <path
            className="mountain-layer mountain-near-3"
            d="M840,240 L880,230 L920,210 L960,225 L1000,200 L1040,220 L1080,190 L1120,210 L1160,180 L1200,200 L1240,170 L1280,190 L1320,160 L1360,180 L1400,150 L1440,170 L1440,320 L840,320 Z"
          />

          {/* Snow caps for right foreground mountain */}
          <path
            className="mountain-layer mountain-near-snow-3"
            d="M1080,190 L1090,200 L1080,195 L1070,200 Z M1160,180 L1170,190 L1160,185 L1150,190 Z M1240,170 L1250,180 L1240,175 L1230,180 Z M1320,160 L1330,170 L1320,165 L1310,170 Z M1400,150 L1410,160 L1400,155 L1390,160 Z"
          />

          {/* Forest/foothills layer */}
          <path
            className="mountain-layer forest"
            d="M0,280 C240,275 480,285 720,280 C960,275 1200,285 1440,280 L1440,320 L0,320 Z"
          />

          {/* Distinctive standalone peaks */}
          <path
            className="mountain-layer mountain-peak-1"
            d="M180,250 L240,180 L300,250 Z"
          />
          <path
            className="mountain-layer mountain-peak-snow-1"
            d="M240,180 L250,195 L240,190 L230,195 Z"
          />

          <path
            className="mountain-layer mountain-peak-2"
            d="M720,240 L760,170 L800,240 Z"
          />
          <path
            className="mountain-layer mountain-peak-snow-2"
            d="M760,170 L770,185 L760,180 L750,185 Z"
          />

          <path
            className="mountain-layer mountain-peak-3"
            d="M1080,220 L1140,140 L1200,220 Z"
          />
          <path
            className="mountain-layer mountain-peak-snow-3"
            d="M1140,140 L1150,155 L1140,150 L1130,155 Z"
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

        /* Light mode mountain styles */
        :global(:root:not(.dark)) .mountain-bg {
          fill: rgba(56, 189, 248, 0.3);
        }

        :global(:root:not(.dark)) .mountain-bg-snow {
          fill: rgba(255, 255, 255, 0.5);
        }

        :global(:root:not(.dark)) .mountain-middle-1 {
          fill: rgba(14, 165, 233, 0.4);
        }

        :global(:root:not(.dark)) .mountain-middle-2 {
          fill: rgba(6, 182, 212, 0.35);
        }

        :global(:root:not(.dark)) .mountain-middle-snow-1,
        :global(:root:not(.dark)) .mountain-middle-snow-2 {
          fill: rgba(255, 255, 255, 0.6);
        }

        :global(:root:not(.dark)) .mountain-near-1 {
          fill: rgba(2, 132, 199, 0.45);
        }

        :global(:root:not(.dark)) .mountain-near-2 {
          fill: rgba(3, 105, 161, 0.5);
        }

        :global(:root:not(.dark)) .mountain-near-3 {
          fill: rgba(8, 145, 178, 0.45);
        }

        :global(:root:not(.dark)) .mountain-near-snow-2,
        :global(:root:not(.dark)) .mountain-near-snow-3 {
          fill: rgba(255, 255, 255, 0.7);
        }

        :global(:root:not(.dark)) .mountain-peak-1 {
          fill: rgba(3, 105, 161, 0.6);
        }

        :global(:root:not(.dark)) .mountain-peak-2 {
          fill: rgba(13, 148, 136, 0.55);
        }

        :global(:root:not(.dark)) .mountain-peak-3 {
          fill: rgba(6, 182, 212, 0.5);
        }

        :global(:root:not(.dark)) .mountain-peak-snow-1,
        :global(:root:not(.dark)) .mountain-peak-snow-2,
        :global(:root:not(.dark)) .mountain-peak-snow-3 {
          fill: rgba(255, 255, 255, 0.7);
        }

        :global(:root:not(.dark)) .forest {
          fill: rgba(16, 185, 129, 0.3);
        }

        /* Dark mode mountain styles */
        :global(.dark) .mountain-bg {
          fill: rgba(12, 74, 110, 0.5);
        }

        :global(.dark) .mountain-bg-snow {
          fill: rgba(226, 232, 240, 0.3);
        }

        :global(.dark) .mountain-middle-1 {
          fill: rgba(15, 118, 110, 0.5);
        }

        :global(.dark) .mountain-middle-2 {
          fill: rgba(8, 145, 178, 0.45);
        }

        :global(.dark) .mountain-middle-snow-1,
        :global(.dark) .mountain-middle-snow-2 {
          fill: rgba(226, 232, 240, 0.4);
        }

        :global(.dark) .mountain-near-1 {
          fill: rgba(17, 94, 89, 0.55);
        }

        :global(.dark) .mountain-near-2 {
          fill: rgba(7, 89, 133, 0.6);
        }

        :global(.dark) .mountain-near-3 {
          fill: rgba(5, 150, 105, 0.5);
        }

        :global(.dark) .mountain-near-snow-2,
        :global(.dark) .mountain-near-snow-3 {
          fill: rgba(226, 232, 240, 0.5);
        }

        :global(.dark) .mountain-peak-1 {
          fill: rgba(7, 89, 133, 0.65);
        }

        :global(.dark) .mountain-peak-2 {
          fill: rgba(5, 150, 105, 0.6);
        }

        :global(.dark) .mountain-peak-3 {
          fill: rgba(8, 145, 178, 0.55);
        }

        :global(.dark) .mountain-peak-snow-1,
        :global(.dark) .mountain-peak-snow-2,
        :global(.dark) .mountain-peak-snow-3 {
          fill: rgba(226, 232, 240, 0.5);
        }

        :global(.dark) .forest {
          fill: rgba(5, 150, 105, 0.4);
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

        .mountain-bg,
        .mountain-bg-snow {
          animation: mountain-sway-slow 200s ease-in-out infinite;
        }

        .mountain-middle-1,
        .mountain-middle-snow-1 {
          animation: mountain-sway-medium 180s ease-in-out infinite;
        }

        .mountain-middle-2,
        .mountain-middle-snow-2 {
          animation: mountain-sway-medium 190s ease-in-out infinite reverse;
        }

        .mountain-near-1 {
          animation: mountain-sway-slow 210s ease-in-out infinite;
        }

        .mountain-near-2,
        .mountain-near-snow-2 {
          animation: mountain-sway-slow 220s ease-in-out infinite reverse;
        }

        .mountain-near-3,
        .mountain-near-snow-3 {
          animation: mountain-sway-slow 230s ease-in-out infinite;
        }

        .mountain-peak-1,
        .mountain-peak-snow-1 {
          animation: mountain-sway-subtle 160s ease-in-out infinite;
        }

        .mountain-peak-2,
        .mountain-peak-snow-2 {
          animation: mountain-sway-subtle 170s ease-in-out infinite reverse;
        }

        .mountain-peak-3,
        .mountain-peak-snow-3 {
          animation: mountain-sway-subtle 180s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .mountains-svg {
            height: 40% !important;
          }
        }
      `}</style>
    </>
  );
}
