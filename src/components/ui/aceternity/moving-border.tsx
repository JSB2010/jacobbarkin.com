"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export interface MovingBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
}

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderClassName,
  ...otherProps
}: MovingBorderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) return;

    const animateBorder = () => {
      if (!containerRef.current) return;
      const timestamp = Date.now();
      const { width, height } = containerRef.current.getBoundingClientRect();

      const progress = (timestamp % duration) / duration;
      const angle = progress * 2 * Math.PI;

      const x = Math.cos(angle) * (width / 2 - 10) + width / 2;
      const y = Math.sin(angle) * (height / 2 - 10) + height / 2;

      setPosition({ x, y });
      requestAnimationFrame(animateBorder);
    };

    const animationId = requestAnimationFrame(animateBorder);
    return () => cancelAnimationFrame(animationId);
  }, [duration, isHovered]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-xl overflow-hidden p-[1px]",
        containerClassName
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...otherProps}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-[inherit] z-[1] opacity-0 transition-opacity duration-500",
          isHovered && "opacity-100",
          borderClassName
        )}
        style={{
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(var(--primary-rgb), 0.8) 0%, transparent 50%)`,
        }}
      />
      <div
        className={cn(
          "relative z-[2] rounded-[inherit] bg-background",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
