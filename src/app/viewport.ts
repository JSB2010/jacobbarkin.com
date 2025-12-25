import type { Viewport } from 'next';

// Enhanced viewport configuration for the home page
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#3b82f6",
  colorScheme: "dark light",
};
