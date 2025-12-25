"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force a client-side only render to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Add a class to the body when mounted to enable transitions
  React.useEffect(() => {
    if (mounted) {
      document.body.classList.add('theme-transitions-enabled');
    }
    return () => {
      document.body.classList.remove('theme-transitions-enabled');
    };
  }, [mounted]);

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
