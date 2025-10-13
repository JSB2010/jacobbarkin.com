"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface BackgroundGradientProps {
  className?: string;
  containerClassName?: string;
  animate?: boolean;
  children?: React.ReactNode;
  gradientPosition?: { x: number, y: number };
  index?: number;
  useGlobalGradient?: boolean;
}

export const BackgroundGradient = ({
  className = "",
  containerClassName = "",
  animate = true,
  children,
  gradientPosition,
  index = 0,
  useGlobalGradient = false,
}: BackgroundGradientProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    if (animate) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [animate]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Generate gradient colors based on position in the grid
  const getGradientStyle = () => {
    if (useGlobalGradient && gradientPosition) {
      // Calculate hue based on position (0-360)
      const baseHue = 180; // Starting hue
      const hueRange = 240; // Range of hues to use

      // Create a continuous gradient across all cards
      const hue1 = (baseHue + gradientPosition.x * hueRange) % 360;
      const hue2 = (baseHue + ((gradientPosition.x + 0.5) % 1) * hueRange) % 360;

      // Use HSL for better control over the gradient
      return {
        background: `linear-gradient(135deg,
          hsla(${hue1}, 80%, 65%, 0.25),
          transparent 40%,
          hsla(${hue2}, 80%, 65%, 0.25))`,
      };
    }

    // Default gradient if not using global gradient
    return {
      background: `linear-gradient(135deg,
        rgba(var(--primary-rgb), 0.2),
        transparent 40%,
        rgba(var(--accent-rgb), 0.2))`,
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl",
        containerClassName
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0",
          isHovered && "opacity-100"
        )}
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb), 0.15), transparent 40%)`,
        }}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 opacity-100 transition-opacity duration-500",
          className
        )}
        style={getGradientStyle()}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};
