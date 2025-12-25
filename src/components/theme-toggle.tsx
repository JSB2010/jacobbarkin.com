"use client";

import * as React from "react";
import { Moon, Sun, Laptop, Check } from "lucide-react";
import { useThemeDetection } from "@/hooks/use-theme-detection";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme, mounted } = useThemeDetection();

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="relative h-9">
        <span className="sr-only">Toggle theme</span>
        <span className="px-1">Theme</span>
      </Button>
    );
  }

  // Get the appropriate icon and label based on the current theme
  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-4 w-4 mr-1.5 text-amber-500" />;
    if (theme === "dark") return <Moon className="h-4 w-4 mr-1.5 text-indigo-400" />;
    return <Laptop className="h-4 w-4 mr-1.5 text-primary" />;
  };

  const getThemeLabel = () => {
    if (theme === "system") {
      return (
        <span className="flex items-center">
          <span>System</span>
          <span className="text-xs text-muted-foreground ml-1">
            ({effectiveTheme})
          </span>
        </span>
      );
    }
    const themeValue = theme || 'system';
    return <span>{themeValue.charAt(0).toUpperCase() + themeValue.slice(1)}</span>;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
        >
          {getThemeIcon()}
          <span className="hidden sm:inline-flex">{getThemeLabel()}</span>
          <span className="sm:hidden">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-400" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-primary" />
            <span>System</span>
            {theme === "system" && (
              <span className="text-xs text-muted-foreground ml-1">
                ({effectiveTheme})
              </span>
            )}
          </div>
          {theme === "system" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
