"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Laptop,
  LineChart,
  Train,
  Code,
  User,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Newspaper
} from "lucide-react";
import { FaMoneyBillWave, FaRunning, FaSkiing } from "react-icons/fa";
import { useEffect, useState } from "react";
import { SocialIcons } from "@/components/ui/social-icons";

// Import Aceternity UI components
import { BackgroundGradient } from "@/components/ui/aceternity/background-gradient";
import { MovingBorder } from "@/components/ui/aceternity/moving-border";
import { TextRevealCard } from "@/components/ui/aceternity/text-reveal-card";
import { OptimizedBackgroundImage } from "@/components/ui/optimized-background-image";
import { LazyLoad } from "@/components/ui/lazy-load";
import { EqualHeightGrid } from "@/components/ui/equal-height-grid";
import Image from "next/image";

export default function Home() {
  // State to store the current greeting - start with null to avoid hydration mismatch
  const [greeting, setGreeting] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Function to get time-based greeting
  const getTimeGreeting = () => {
    const currentHour = new Date().getHours();

    // Early morning (midnight to 5:59 AM)
    if (currentHour >= 0 && currentHour < 6) {
      return "Good Night";
    }
    // Morning (6:00 AM to 11:59 AM)
    else if (currentHour >= 6 && currentHour < 12) {
      return "Good Morning";
    }
    // Afternoon (12:00 PM to 5:59 PM)
    else if (currentHour >= 12 && currentHour < 18) {
      return "Good Afternoon";
    }
    // Evening (6:00 PM to 9:59 PM)
    else if (currentHour >= 18 && currentHour < 22) {
      return "Good Evening";
    }
    // Night (10:00 PM to 11:59 PM)
    else {
      return "Good Night";
    }
  };

  // Update greeting when component mounts and set interval to update it
  useEffect(() => {
    // Mark component as mounted to avoid hydration mismatch
    setIsMounted(true);
    // Set initial greeting
    setGreeting(getTimeGreeting());

    // Update greeting every minute to handle time changes
    const intervalId = setInterval(() => {
      setGreeting(getTimeGreeting());
    }, 60000); // 60000 ms = 1 minute

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="mt-8 sm:mt-10 md:mt-12 mb-8 sm:mb-10 md:mb-12 mx-4 sm:mx-6 md:mx-8 relative py-12 sm:py-16 md:py-20 overflow-hidden theme-mountains rounded-xl shadow-lg">
        <OptimizedBackgroundImage
          src="/images/mountains-bg.jpg"
          alt="Mountains background"
          priority={true}
          overlayClassName="opacity-30 dark:opacity-20"
          className="rounded-xl"
        />

        <div className="container px-4 sm:px-6 md:px-8 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-6 text-center md:text-left">
              <MovingBorder
                className="p-0.5"
                containerClassName="rounded-full mx-auto md:mx-0 w-fit"
                duration={3000}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background text-primary text-sm font-medium">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                  {isMounted && greeting ? `${greeting}, welcome to my portfolio!` : 'Welcome to my portfolio!'}
                </div>
              </MovingBorder>

              <div className="border-none shadow-none p-0 bg-transparent">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                  Jacob Barkin
                </h1>

                {/* Mobile-only image - shown between name and title */}
                <div className="md:hidden flex justify-center mt-4 mb-4">
                  <BackgroundGradient className="rounded-full">
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-2 border-background shadow-xl">
                      <Image
                        src="/images/optimized/Jacob Boreas.webp"
                        alt="Jacob Barkin"
                        fill
                        className="object-cover"
                        style={{ objectPosition: 'center 30%' }}
                        priority={true}
                        quality={85}
                        sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 256px"
                        fetchPriority="high"
                      />
                    </div>
                  </BackgroundGradient>
                </div>

                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mt-0 md:mt-4 sm:md:mt-6">
                  Developer & Technology Consultant
                </p>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                <span className="px-2 sm:px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm flex items-center gap-1">
                  <Laptop className="h-3 w-3" /> Developer
                </span>
                <span className="px-2 sm:px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm flex items-center gap-1">
                  <LineChart className="h-3 w-3" /> Tech Support
                </span>
                <span className="px-2 sm:px-3 py-1 rounded-full bg-accent/10 text-accent text-xs sm:text-sm flex items-center gap-1">
                  <Code className="h-3 w-3" /> Projects
                </span>
                <span className="px-2 sm:px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs sm:text-sm flex items-center gap-1">
                  <FaMoneyBillWave className="h-3 w-3" /> Financial Literacy
                </span>
                <span className="px-2 sm:px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs sm:text-sm flex items-center gap-1">
                  <Newspaper className="h-3 w-3" /> Journalism
                </span>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto md:mx-0">
                I&apos;m passionate about technology, financial literacy, and making a positive impact.
                With a focus on accessibility and innovation, I develop solutions that help people solve their technology challenges while also advocating for youth financial education.
                I also write and edit for The Sun Devil&apos;s Advocate (the Advocate) to help people stay informed.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 justify-center md:justify-start">
                <Link href="/projects" className="w-full sm:w-auto">
                  <BackgroundGradient className="rounded-xl w-full sm:w-auto">
                    <Button
                      size="default"
                      className="bg-primary hover:opacity-90 transition-opacity border-none text-sm sm:text-base h-10 sm:h-11 flex items-center justify-center w-full"
                    >
                      <Code className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      View My Projects
                    </Button>
                  </BackgroundGradient>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="default"
                    className="border-primary/20 hover:bg-primary/15 hover:text-primary text-sm sm:text-base h-10 sm:h-11 flex items-center justify-center w-full"
                  >
                    <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    About Me
                  </Button>
                </Link>
                <Link href="https://askthekidz.com" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="default"
                    className="text-sm sm:text-base h-10 sm:h-11 flex items-center justify-center w-full bg-[rgb(34,44,130)] text-white hover:bg-[rgb(28,36,108)]"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Ask The Kidz
                  </Button>
                </Link>
              </div>

              <div className="flex gap-3 sm:gap-4 mt-2 justify-center md:justify-start">
                <SocialIcons size="sm" />
              </div>
            </div>

            {/* Desktop-only image - hidden on mobile */}
            <div className="hidden md:flex justify-center md:justify-end mt-6 sm:mt-0">
              <BackgroundGradient className="rounded-full">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden border-2 sm:border-4 border-background shadow-xl">
                  <Image
                    src="/images/optimized/Jacob Boreas.webp"
                    alt="Jacob Barkin"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center 30%' }}
                    priority={true}
                    quality={85}
                    sizes="(max-width: 768px) 0px, (max-width: 1024px) 40vw, 30vw"
                    fetchPriority="high"
                  />
                </div>
              </BackgroundGradient>
            </div>
          </div>
        </div>
      </section>

      {/* Interests Section */}
      <LazyLoad className="py-12 sm:py-16 md:py-20 theme-technology relative overflow-hidden">
        <section>
          <div className="container relative z-10">
            <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
              <TextRevealCard
                text="My Interests"
                revealText="Explore My Passions"
                className="border-none shadow-none p-0 bg-transparent text-center"
              >
                <div className="h-1 w-16 sm:w-20 bg-gradient-blue-green rounded-full mx-auto mt-3 sm:mt-4"></div>
              </TextRevealCard>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center items-stretch mx-auto max-w-screen-xl">
              {/* Technology Card */}
              <BackgroundGradient className="rounded-xl h-full">
                <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                  <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 flex-grow flex flex-col">
                    <div className="flex flex-col items-center text-center h-full">
                      <MovingBorder className="p-0.5" containerClassName="rounded-full mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-full bg-background text-primary">
                          <Laptop className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                      </MovingBorder>
                      <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Technology</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                        Software development, accessibility, and creating technology that makes a difference.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </BackgroundGradient>

              {/* Tech Support Card */}
              <BackgroundGradient className="rounded-xl h-full">
                <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                  <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 flex-grow flex flex-col">
                    <div className="flex flex-col items-center text-center h-full">
                      <MovingBorder className="p-0.5" containerClassName="rounded-full mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-full bg-background text-primary">
                          <LineChart className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                      </MovingBorder>
                      <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Tech Support</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                        Providing personalized technology consulting and solutions for various devices and software.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </BackgroundGradient>

              {/* Financial Literacy Card */}
              <BackgroundGradient className="rounded-xl h-full">
                <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                  <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 flex-grow flex flex-col">
                    <div className="flex flex-col items-center text-center h-full">
                      <MovingBorder className="p-0.5" containerClassName="rounded-full mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-full bg-background text-primary">
                          <FaMoneyBillWave className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                      </MovingBorder>
                      <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Financial Literacy</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                        Promoting financial education for youth and helping young people develop essential money management skills.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </BackgroundGradient>

              {/* Education / EdTech Card */}
              <BackgroundGradient className="rounded-xl h-full">
                <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                  <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 flex-grow flex flex-col">
                    <div className="flex flex-col items-center text-center h-full">
                      <MovingBorder className="p-0.5" containerClassName="rounded-full mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-full bg-background text-primary">
                          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                      </MovingBorder>
                      <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Education / EdTech</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                        Exploring how technology can make learning more engaging, accessible, and effective.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </BackgroundGradient>

              {/* Journalism Card */}
              <BackgroundGradient className="rounded-xl h-full">
                <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                  <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 flex-grow flex flex-col">
                    <div className="flex flex-col items-center text-center h-full">
                      <MovingBorder className="p-0.5" containerClassName="rounded-full mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-full bg-background text-primary">
                          <Newspaper className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                      </MovingBorder>
                      <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Journalism</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                        Staff writer turned news section editor for The Sun Devil&apos;s Advocate, focused on clear reporting that keeps people informed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </BackgroundGradient>

              {/* Transit Card */}
              <BackgroundGradient className="rounded-xl h-full">
                <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 flex-grow flex flex-col">
                  <div className="flex flex-col items-center text-center h-full">
                    <MovingBorder className="p-0.5" containerClassName="rounded-full mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 rounded-full bg-background text-primary">
                        <Train className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                    </MovingBorder>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Transit</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                      Research and advocacy for improved public transit systems.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </BackgroundGradient>

            {/* Aviation Card */}
            <BackgroundGradient className="rounded-xl h-full">
              <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 flex-grow flex flex-col">
                  <div className="flex flex-col items-center text-center h-full">
                    <MovingBorder className="p-0.5" containerClassName="rounded-full mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 rounded-full bg-background text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6 sm:h-8 sm:w-8"
                        >
                          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                        </svg>
                      </div>
                    </MovingBorder>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Aviation</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                      Fascination with aircraft, flight dynamics, and aerospace technology.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </BackgroundGradient>

            {/* Running Card */}
            <BackgroundGradient className="rounded-xl h-full">
              <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 flex-grow flex flex-col">
                  <div className="flex flex-col items-center text-center h-full">
                    <MovingBorder className="p-0.5" containerClassName="rounded-full mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 rounded-full bg-background text-primary">
                        <FaRunning className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                    </MovingBorder>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Running</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                      Passionate about cross country running, competing in races and enjoying the physical and mental benefits of the sport.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </BackgroundGradient>

            {/* Skiing Card */}
            <BackgroundGradient className="rounded-xl h-full">
              <Card className="border-0 bg-background/80 backdrop-blur-sm h-full flex flex-col">
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 flex-grow flex flex-col">
                  <div className="flex flex-col items-center text-center h-full">
                    <MovingBorder className="p-0.5" containerClassName="rounded-full mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 rounded-full bg-background text-primary">
                        <FaSkiing className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                    </MovingBorder>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Skiing</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                      Skiing at Breckenridge since I was 3 years old, enjoying the thrill of the slopes and the beautiful mountain scenery.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </BackgroundGradient>
          </div>
        </div>
      </section>
      </LazyLoad>

      {/* Featured Projects Section */}

      <section className="py-12 sm:py-16 md:py-20 theme-space relative overflow-hidden">
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
            <TextRevealCard
              text="Featured Projects"
              revealText="Explore My Work"
              className="border-none shadow-none p-0 bg-transparent text-center"
            >
              <div className="h-1 w-16 sm:w-20 bg-gradient-blue-green rounded-full mx-auto mt-3 sm:mt-4"></div>
            </TextRevealCard>
          </div>

          <EqualHeightGrid>
            {/* Ask The Kidz */}
            <Link href="https://www.askthekidz.com" target="_blank" rel="noopener noreferrer" className="block h-full">
              <BackgroundGradient className="rounded-xl h-full">
                <Card className="border-0 bg-background/80 backdrop-blur-sm h-full">
                  <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden rounded-t-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <MovingBorder className="p-0.5" containerClassName="rounded-full">
                        <div className="p-3 sm:p-4 rounded-full bg-background text-primary">
                          <LineChart className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                        </div>
                      </MovingBorder>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 card-content">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors">
                      Ask The Kidz
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                      A technology consulting business providing tech support and solutions for various devices, software, and smart home setups. Helping people solve their technology challenges with personalized service.
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary text-xs">Technology Consulting</span>
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-secondary/10 text-secondary text-xs">Tech Support</span>
                    </div>
                  </div>
                </Card>
              </BackgroundGradient>
            </Link>

            {/* Public Transportation Research */}
            <Link href="/public-transportation" className="block h-full">
              <BackgroundGradient className="rounded-xl h-full">
                <Card className="border-0 bg-background/80 backdrop-blur-sm h-full">
                  <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden rounded-t-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary flex items-center justify-center">
                      <MovingBorder className="p-0.5" containerClassName="rounded-full">
                        <div className="p-3 sm:p-4 rounded-full bg-background text-primary">
                          <Train className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                        </div>
                      </MovingBorder>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 card-content">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors">
                      Public Transportation Research
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                      Comprehensive research on public transportation systems in Colorado, focusing on accessibility improvements and sustainable solutions.
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary text-xs">Research</span>
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-secondary/10 text-secondary text-xs">Accessibility</span>
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-green-500/10 text-green-500 text-xs">Sustainability</span>
                    </div>
                  </div>
                </Card>
              </BackgroundGradient>
            </Link>

            {/* Portfolio Website */}
            <Link href="/portfolio-website" className="block h-full">
              <BackgroundGradient className="rounded-xl h-full">
                <Card className="border-0 bg-background/80 backdrop-blur-sm h-full">
                  <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden rounded-t-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/90 flex items-center justify-center">
                      <MovingBorder className="p-0.5" containerClassName="rounded-full">
                        <div className="p-3 sm:p-4 rounded-full bg-background text-primary">
                          <Code className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                        </div>
                      </MovingBorder>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 card-content">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors">
                      Portfolio Website
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                      A modern, responsive portfolio website showcasing my projects, skills, and interests with a focus on accessibility and user experience.
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary text-xs">Next.js</span>
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-secondary/10 text-secondary text-xs">Tailwind CSS</span>
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs">shadcn UI</span>
                    </div>
                  </div>
                </Card>
              </BackgroundGradient>
            </Link>
          </EqualHeightGrid>

          <div className="flex justify-center mt-8 sm:mt-10 md:mt-12">
            <MovingBorder className="p-0.5 rounded-lg">
              <Button
                asChild
                className="bg-primary hover:opacity-90 transition-opacity border-none text-sm sm:text-base h-10 sm:h-11"
              >
                <Link href="/projects" className="group">
                  View All Projects
                  <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </MovingBorder>
          </div>
        </div>
      </section>
    </>
  );
}
