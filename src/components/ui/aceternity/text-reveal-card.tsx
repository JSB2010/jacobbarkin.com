"use client";

import { cn } from "@/lib/utils";
import { useMotionValue, motion, useSpring, useTransform } from "framer-motion";
import React, { useRef, useState } from "react";

export const TextRevealCard = ({
  text,
  revealText,
  children,
  className,
}: {
  text: string;
  revealText: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width;
    const yPct = mouseY / height;
    x.set(xPct - 0.5);
    y.set(yPct - 0.5);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };



  const springConfig = { stiffness: 125, damping: 15, mass: 0.1 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const maskImageSpring = useTransform(
    [xSpring, ySpring],
    (values: number[]) => {
      const xVal = values[0] ?? 0;
      const yVal = values[1] ?? 0;
      const xOffset = (xVal * 100).toFixed(2);
      const yOffset = (yVal * 100).toFixed(2);
      return `radial-gradient(
        250px circle at ${xOffset}% ${yOffset}%,
        rgba(255,255,255,1) 0%,
        rgba(255,255,255,0) 80%
      )`;
    }
  );

  return (
    <button
      type="button"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-background p-8 text-left w-full",
        className
      )}
    >
      <div className="relative z-10">
        <div className="text-2xl font-bold text-foreground">{text}</div>
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 flex items-center justify-center text-5xl font-bold text-primary/40"
        style={{
          WebkitMaskImage: maskImageSpring,
          maskImage: maskImageSpring,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        {revealText}
      </motion.div>
    </button>
  );
};
