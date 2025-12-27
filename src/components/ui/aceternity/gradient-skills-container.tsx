"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface GradientSkillsContainerProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  columns?: number;
  rows?: number;
}

export const GradientSkillsContainer = ({
  children,
  className = "",
  containerClassName = "",
  columns = 4,
  rows = 3,
}: GradientSkillsContainerProps) => {
  // Process children to add gradient position props
  const childrenArray = React.Children.toArray(children);
  const totalChildren = childrenArray.length;

  // Calculate actual rows and columns based on total children
  const actualColumns = Math.min(columns, totalChildren);
  const actualRows = Math.ceil(totalChildren / actualColumns);

  const processedChildren = childrenArray.map((child, index) => {
    if (!React.isValidElement(child) || typeof child.type === "string" || child.type === React.Fragment) {
      return child;
    }

    // Calculate position in the grid
    const row = Math.floor(index / actualColumns);
    const col = index % actualColumns;

    // Calculate normalized position (0-1) for gradient
    const normalizedX = actualColumns > 1 ? col / (actualColumns - 1) : 0.5;
    const normalizedY = actualRows > 1 ? row / (actualRows - 1) : 0.5;

    // Pass gradient position to child
    // Use type assertion to pass custom props to child components
    return React.cloneElement(child as React.ReactElement<{ gradientPosition?: { x: number; y: number }; index?: number; totalItems?: number }>, {
      gradientPosition: { x: normalizedX, y: normalizedY },
      index,
      totalItems: totalChildren,
    });
  });

  return (
    <div
      className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6", containerClassName)}
    >
      {processedChildren}
    </div>
  );
};
