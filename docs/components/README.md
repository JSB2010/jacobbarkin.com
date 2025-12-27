# Component Documentation

This document provides detailed information about the key React components used in the Jacob Barkin Portfolio website.

## Table of Contents

- [Layout Components](#layout-components)
  - [ThemeProvider](#themeprovider)
  - [ThemeToggle](#themetoggle)
  - [ThemeIndicator](#themeindicator)
  - [Header](#header)
  - [Footer](#footer)
  - [PageHero](#pagehero)
- [UI Components](#ui-components)
  - [OptimizedImage](#optimizedimage)
  - [MotionWrapper](#motionwrapper)
  - [LazyLoad](#lazyload)
- [Aceternity UI Components](#aceternity-ui-components)
  - [WavyBackground](#wavybackground)
  - [TextRevealCard](#textrevealcard)
  - [Meteors](#meteors)
  - [BackgroundGradient](#backgroundgradient)
  - [MovingBorder](#movingborder)
- [Contact Form Components](#contact-form-components)
  - [ContactForm](#contactform)
  - [FormStatus](#formstatus)
  - [FormPersistenceIndicator](#formpersistenceindicator)
- [Project Components](#project-components)
  - [ProjectCard](#projectcard)
  - [GithubProjects](#githubprojects)
  - [ProjectGrid](#projectgrid)
- [Admin Components](#admin-components)
  - [AdminLogin](#adminlogin)
  - [SubmissionsList](#submissionslist)
  - [SubmissionDetails](#submissiondetails)

## Layout Components

### ThemeProvider

**File**: `src/components/theme-provider.tsx`

**Description**: A wrapper component that provides theme context to the application using next-themes.

**Props**:
- `children`: React nodes to be wrapped with the theme provider
- `...props`: Additional props passed to NextThemesProvider

**Usage**:
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  storageKey="jacob-barkin-theme"
>
  {children}
</ThemeProvider>
```

**Implementation Details**:
- Uses React's `useState` and `useEffect` to handle client-side rendering
- Adds a class to the body when mounted to enable theme transitions
- Prevents hydration mismatch by delaying rendering until mounted

### ThemeToggle

**File**: `src/components/theme-toggle.tsx`

**Description**: A dropdown menu component that allows users to switch between light, dark, and system themes.

**Props**: None

**Usage**:
```tsx
<ThemeToggle />
```

**Implementation Details**:
- Uses the `useThemeDetection` hook to access and modify the current theme
- Displays different icons based on the current theme (Sun, Moon, or Laptop)
- Shows the current theme name and a checkmark next to the active theme
- Handles hydration mismatch by not rendering until mounted

### ThemeIndicator

**File**: `src/components/theme-indicator.tsx`

**Description**: A small indicator that shows the current theme in the bottom right corner of the screen.

**Props**: None

**Usage**:
```tsx
<ThemeIndicator />
```

**Implementation Details**:
- Uses the `useThemeDetection` hook to access the current theme
- Shows different icons based on the current theme (Sun, Moon, or Laptop)
- Displays the theme name and, for system theme, shows the effective theme in parentheses

### PageHero

**File**: `src/components/ui/page-hero.tsx`

**Description**: A hero section component for page headers with parallax scrolling effects.

**Props**:
- `title`: The main title text
- `subtitle?`: Optional subtitle text
- `backgroundImage?`: Optional background image URL
- `gradient?`: Optional gradient background
- `height?`: Optional height of the hero section (default: 'medium')
- `align?`: Optional text alignment (default: 'center')
- `className?`: Optional additional CSS classes

**Usage**:
```tsx
<PageHero
  title="Projects"
  subtitle="A collection of my work"
  backgroundImage="/images/hero-bg.jpg"
  height="large"
/>
```

**Implementation Details**:
- Implements parallax scrolling effect based on window scroll position
- Adjusts parallax intensity based on device type (mobile vs. desktop)
- Uses gradient text for titles with configurable colors
- Includes responsive design with different layouts for mobile and desktop

## UI Components

### OptimizedImage

**File**: `src/components/ui/optimized-image.tsx`

**Description**: A standardized image component that optimizes images using Next.js Image component.

**Props**:
- `src`: Image source URL
- `alt`: Alternative text for the image
- `className?`: Optional CSS classes for the image
- `containerClassName?`: Optional CSS classes for the container
- `fill?`: Whether the image should fill its container
- `width?`: Image width (default: 800)
- `height?`: Image height (default: 600)
- `priority?`: Whether to prioritize loading (default: false)
- `quality?`: Image quality (default: 85)
- `sizes?`: Responsive sizes attribute
- `...props`: Additional props passed to the Image component

**Usage**:
```tsx
<OptimizedImage
  src="/images/profile.jpg"
  alt="Jacob Barkin"
  width={400}
  height={400}
  priority={true}
  className="rounded-full"
/>
```

**Implementation Details**:
- Uses Next.js Image component for automatic optimization
- Supports WebP format with fallback to original format
- Handles responsive images with appropriate sizes attribute
- Supports both fill mode and explicit dimensions

### MotionWrapper

**File**: `src/components/ui/motion-wrapper.tsx`

**Description**: A wrapper component that dynamically loads framer-motion for animations.

**Props**:
- `children`: React nodes to be animated
- `className?`: Optional CSS classes
- `initial?`: Initial animation state
- `animate?`: Target animation state
- `exit?`: Exit animation state
- `transition?`: Animation transition properties
- `whileHover?`: Animation state while hovered
- `whileTap?`: Animation state while tapped
- `whileInView?`: Animation state while in viewport
- `viewport?`: Viewport options for whileInView
- `variants?`: Animation variants
- `layoutId?`: Layout ID for shared layout animations
- `layout?`: Whether to animate layout changes

**Usage**:
```tsx
<MotionWrapper
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <div>Animated content</div>
</MotionWrapper>
```

**Implementation Details**:
- Dynamically imports framer-motion to reduce initial bundle size
- Handles SSR by not rendering animations until mounted
- Provides a fallback div during SSR to prevent hydration mismatch

### LazyLoad

**File**: `src/components/ui/lazy-load.tsx`

**Description**: A component that lazily loads its children when they enter the viewport.

**Props**:
- `children`: React nodes to be lazily loaded
- `className?`: Optional CSS classes
- `placeholder?`: Optional placeholder to show while loading
- `rootMargin?`: IntersectionObserver root margin (default: "200px")
- `threshold?`: IntersectionObserver threshold (default: 0)

**Usage**:
```tsx
<LazyLoad
  placeholder={<div className="h-64 w-full bg-gray-200 animate-pulse" />}
  rootMargin="100px"
>
  <ComplexComponent />
</LazyLoad>
```

**Implementation Details**:
- Uses IntersectionObserver to detect when the component enters the viewport
- Shows a placeholder until the component is visible
- Configurable rootMargin to load content before it enters the viewport
- Cleans up the observer when the component unmounts

## Aceternity UI Components

### WavyBackground

**File**: `src/components/ui/aceternity/wavy-background.tsx`

**Description**: A component that creates an animated wavy background effect.

**Props**:
- `children`: React nodes to display over the background
- `className?`: Optional CSS classes
- `colors?`: Array of colors for the waves
- `waveWidth?`: Width of each wave
- `backgroundFill?`: Background fill color
- `blur?`: Blur amount for the waves
- `speed?`: Animation speed

**Usage**:
```tsx
<WavyBackground className="max-w-4xl mx-auto pb-40">
  <h1 className="text-4xl font-bold text-center">Welcome to my portfolio</h1>
</WavyBackground>
```

**Implementation Details**:
- Creates SVG waves with configurable colors and properties
- Animates the waves using CSS animations
- Applies blur effect for a softer appearance
- Positions children content over the animated background

### TextRevealCard

**File**: `src/components/ui/aceternity/text-reveal-card.tsx`

**Description**: A card component that reveals text on hover with a gradient effect.

**Props**:
- `text`: Text to be revealed
- `revealText`: Text that appears on hover
- `className?`: Optional CSS classes
- `gradient?`: Optional gradient colors

**Usage**:
```tsx
<TextRevealCard
  text="Hover me"
  revealText="Hello, I'm Jacob Barkin"
  gradient="from-blue-500 to-green-500"
/>
```

**Implementation Details**:
- Uses CSS transitions for smooth reveal effect
- Applies gradient text color on hover
- Handles both mouse and touch interactions
- Includes accessibility features for keyboard navigation

## Contact Form Components

### ContactForm

**File**: `src/components/contact/contact-form.tsx`

**Description**: The main contact form component with validation and submission handling.

**Props**: None

**Usage**:
```tsx
<ContactForm />
```

**Implementation Details**:
- Uses React Hook Form for form state management and validation
- Implements Zod schema validation for form inputs
- Uses the useFormPersistence hook for auto-saving form data
- Handles form submission to Cloudflare D1 backend
- Provides visual feedback during submission process
- Includes accessibility features and error handling

### FormPersistenceIndicator

**File**: `src/components/contact/form-persistence-indicator.tsx`

**Description**: A component that shows the form persistence status and time remaining.

**Props**:
- `lastSaved`: Date when the form was last saved
- `expiresAt`: Date when the saved form data expires
- `isDirty`: Whether the form has unsaved changes

**Usage**:
```tsx
<FormPersistenceIndicator
  lastSaved={lastSaved}
  expiresAt={expiresAt}
  isDirty={isDirty}
/>
```

**Implementation Details**:
- Shows the time when the form was last saved
- Displays a countdown timer for form data expiration
- Indicates when there are unsaved changes
- Updates in real-time using React's useEffect

## Project Components

### ProjectCard

**File**: `src/components/projects/project-card.tsx`

**Description**: A card component for displaying project information.

**Props**:
- `title`: Project title
- `description`: Project description
- `image?`: Optional project image URL
- `tags?`: Optional array of technology tags
- `url?`: Optional project URL
- `github?`: Optional GitHub repository URL
- `featured?`: Whether the project is featured (default: false)
- `className?`: Optional additional CSS classes

**Usage**:
```tsx
<ProjectCard
  title="Portfolio Website"
  description="My personal portfolio built with Next.js"
  image="/images/projects/portfolio.jpg"
  tags={["Next.js", "Tailwind CSS", "TypeScript"]}
  url="https://jacobbarkin.com"
  github="https://github.com/JSB2010/jacobbarkin.com"
  featured={true}
/>
```

**Implementation Details**:
- Uses the Card component from shadcn UI
- Displays project image with fallback for missing images
- Shows technology tags with appropriate styling
- Includes links to the live project and GitHub repository
- Features enhanced styling for featured projects

### GithubProjects

**File**: `src/components/projects/github-projects.tsx`

**Description**: A component that fetches and displays GitHub repositories as project cards.

**Props**:
- `username`: GitHub username
- `limit?`: Maximum number of repositories to display (default: 6)
- `featured?`: Whether to only show featured repositories (default: false)
- `className?`: Optional additional CSS classes

**Usage**:
```tsx
<GithubProjects
  username="JSB2010"
  limit={4}
  featured={true}
/>
```

**Implementation Details**:
- Fetches repository data from GitHub API
- Filters repositories based on criteria (featured, topics, etc.)
- Transforms repository data into project card format
- Implements loading states and error handling
- Uses client-side caching to reduce API calls
