"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Contact", path: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu when the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="bg-gradient-blue-green h-1"></div>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 overflow-hidden transition-transform group-hover:scale-110">
              <Image
                src="/images/Updated logo.png"
                alt="Jacob Barkin Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-lg sm:text-xl gradient-text">Jacob Barkin</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-sm font-medium transition-all hover:text-primary relative group ${
                pathname === item.path
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-blue-green transition-all duration-300 group-hover:w-full ${
                pathname === item.path ? "w-full" : "w-0"
              }`}></span>
            </Link>
          ))}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="border-primary/20 hover:bg-primary/5 h-12 w-12 rounded-full"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-l-primary/20 w-full max-w-[350px] p-0"
            aria-label="Navigation Menu"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigation links for Jacob Barkin&apos;s website</SheetDescription>

            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 overflow-hidden">
                  <Image
                    src="/images/Updated logo.png"
                    alt="Jacob Barkin Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="font-bold text-xl gradient-text">Jacob Barkin</span>
              </div>
              <ThemeToggle />
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col p-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between text-base font-medium transition-all p-4 rounded-lg mb-1 ${
                    pathname === item.path
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 active:bg-muted"
                  }`}
                >
                  <span className="text-lg">{item.name}</span>
                  {pathname === item.path && (
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t mt-auto">
              <div className="text-xs text-center text-muted-foreground">
                &copy; {new Date().getFullYear()} Jacob Barkin
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
