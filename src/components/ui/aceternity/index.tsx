"use client";

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '../loading-spinner';

// Dynamically import heavy components
const DynamicWavyBackground = dynamic(
  () => import('./wavy-background').then(mod => ({ default: mod.WavyBackground })),
  {
    loading: () => <LoadingSpinner />,
    ssr: true
  }
);

const DynamicTextRevealCard = dynamic(
  () => import('./text-reveal-card').then(mod => ({ default: mod.TextRevealCard })),
  {
    ssr: true
  }
);

const DynamicMeteors = dynamic(
  () => import('./meteors').then(mod => ({ default: mod.Meteors })),
  {
    ssr: true
  }
);

const DynamicCardHoverEffect = dynamic(
  () => import('./card-hover-effect').then(mod => ({ default: mod.HoverEffect })),
  {
    ssr: true
  }
);

const DynamicThreeDCard = dynamic(
  () => import('./3d-card').then(mod => ({ default: mod.ThreeDCard })),
  {
    ssr: true
  }
);

// Re-export components for easy imports
export {
  DynamicWavyBackground as WavyBackground,
  DynamicTextRevealCard as TextRevealCard,
  DynamicMeteors as Meteors,
  DynamicCardHoverEffect as CardHoverEffect,
  DynamicThreeDCard as ThreeDCard
};

// Re-export simpler components directly to avoid unnecessary lazy loading
export { BackgroundGradient } from './background-gradient';
export { MovingBorder } from './moving-border';
export { StaticTextCard } from './static-text-card';
export { Spotlight } from './spotlight';
export { ProjectCards } from './project-cards';
