"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  cardClassName?: string;
  glareClassName?: string;
  rotationIntensity?: number;
  glareOpacity?: number;
  glareSize?: number;
  showGlare?: boolean;
  gradientPosition?: { x: number, y: number };
  index?: number;
  totalItems?: number;
  disabled?: boolean; // Add disabled prop for mobile
}

export const ThreeDCard = ({
  children,
  className,
  containerClassName,
  cardClassName,
  glareClassName,
  rotationIntensity = 20,
  glareOpacity = 0.3,
  glareSize = 0.4,
  showGlare = true,
  gradientPosition,
  index,
  totalItems,
  disabled = false, // Default to enabled
}: ThreeDCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };

    // Initial check
    checkMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Skip effect if disabled or on mobile
    if (disabled || isMobile || !containerRef.current || !cardRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate mouse position relative to the container
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    // Calculate rotation based on mouse position
    // Convert to percentage (-0.5 to 0.5) then multiply by rotation intensity
    const rotateY = ((mouseX / containerRect.width) - 0.5) * rotationIntensity;
    const rotateX = ((mouseY / containerRect.height) - 0.5) * -rotationIntensity;

    // Update rotation state
    setRotation({ x: rotateX, y: rotateY });

    // Update glare position if glare is enabled
    if (showGlare) {
      const glareX = (mouseX / containerRect.width) * 100;
      const glareY = (mouseY / containerRect.height) * 100;
      setGlarePosition({ x: glareX, y: glareY });
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && !isMobile) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !isMobile) {
      setIsHovered(false);
      setRotation({ x: 0, y: 0 });
    }
  };

  // Pass props to children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== "string" && child.type !== React.Fragment) {
      // Use type assertion to pass custom props to child components
      return React.cloneElement(child as React.ReactElement<{ gradientPosition?: { x: number; y: number }; index?: number }>, {
        gradientPosition,
        index,
        // Don't pass totalItems to avoid React DOM prop warning
      });
    }
    return child;
  });

  return (
    <div
      ref={containerRef}
      className={cn("perspective-[1000px] w-full h-full", containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className={cn(
          "w-full h-full relative transition-transform duration-200 ease-out transform-gpu",
          isHovered ? "transition-none" : "transition-transform duration-500",
          cardClassName
        )}
        style={{
          transform: isHovered
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
            : "rotateX(0deg) rotateY(0deg)",
        }}
      >
        {showGlare && (
          <div
            ref={glareRef}
            className={cn(
              "absolute inset-0 pointer-events-none overflow-hidden rounded-xl",
              glareClassName
            )}
          >
            <div
              className="absolute w-full h-full opacity-0 pointer-events-none transition-opacity duration-500"
              style={{
                opacity: isHovered ? glareOpacity : 0,
                background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.8) 0%, transparent ${glareSize * 100}%)`,
              }}
            />
          </div>
        )}
        <div className={cn("h-full w-full", className)}>
          {childrenWithProps}
        </div>
      </div>
    </div>
  );
};
