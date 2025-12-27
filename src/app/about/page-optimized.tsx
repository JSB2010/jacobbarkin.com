import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
// Import actual programming language and technology icons
import {
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiPython,
  SiAppwrite,
  SiReact
} from "react-icons/si";

// Import additional icon sets for technologies that might not be in simple-icons
import { FaUniversalAccess, FaMobileAlt, FaGraduationCap, FaGlobeAmericas } from "react-icons/fa";

// Import Aceternity UI components
import { BackgroundGradient } from "@/components/ui/aceternity/background-gradient";
import { MovingBorder } from "@/components/ui/aceternity/moving-border";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { TextRevealCard } from "@/components/ui/aceternity/text-reveal-card";
import { ThreeDCard } from "@/components/ui/aceternity/3d-card";
import { OptimizedBackgroundImage } from "@/components/ui/optimized-background-image";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { LazyLoad } from "@/components/ui/lazy-load";

export const metadata: Metadata = {
  title: "About Me | Jacob Barkin",
  description: "Learn more about Jacob Barkin, my background, education, and skills in technology and financial education.",
};

export default function AboutPage() {
  return (
    <>      
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 overflow-hidden relative">
        <OptimizedBackgroundImage 
          src="/images/mountains-bg.jpg" 
          alt="Mountains background" 
          priority={true}
          overlayClassName="opacity-30 dark:opacity-20"
        />
        <div className="container relative z-20">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              About Me
            </h1>
            <div className="h-1 w-16 sm:w-20 bg-primary rounded-full mx-auto my-4 sm:my-6 md:my-8"></div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8">
              I&apos;m Jacob Barkin, a student developer passionate about technology, financial education, and making a positive impact through accessible solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
        <Spotlight className="hidden md:block" />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <ThreeDCard
              className="relative aspect-square max-w-xs sm:max-w-sm md:max-w-md mx-auto md:mx-0 rounded-2xl overflow-hidden"
              rotationIntensity={5}
              glareOpacity={0.2}
              glareSize={0.6}
            >
              <BackgroundGradient className="rounded-2xl h-full">
                <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
                  <ResponsiveImage
                    src="/images/Jacob City.png"
                    alt="Jacob Barkin"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 384px, 400px"
                    priority={true}
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay"></div>
                </div>
              </BackgroundGradient>
            </ThreeDCard>

            <div className="px-4 sm:px-6 md:px-0 mt-6 md:mt-0">
              <TextRevealCard
                text="My Journey"
                revealText="About Me"
                className="border-none shadow-none p-0 bg-transparent mb-4 sm:mb-6"
              />
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <p>
                  I&apos;m a sophomore (10th grade) at Kent Denver School with a focus on computer science, technology, and financial education. My passion for technology began at an early age, and I&apos;ve been developing my skills in programming and web development ever since.
                </p>
                <p>
                  Beyond technology, I&apos;m deeply committed to financial education for youth. I believe that understanding personal finance is a critical life skill that should be accessible to everyone, especially young people who are just beginning to navigate the financial world.
                </p>
                <p>
                  I&apos;m also interested in public transportation systems and their impact on communities. I research and advocate for improved public transit, focusing on accessibility and sustainability.
                </p>
                <p>
                  Through my projects and initiatives, I aim to combine these interests to create meaningful solutions that help people learn, grow, and navigate the world more effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section - Lazy loaded */}
      <LazyLoad className="bg-muted/50 relative overflow-hidden">
        <section className="py-10 sm:py-12 md:py-16">
          <div className="container relative z-10 px-4 sm:px-6">
            <TextRevealCard
              text="Education"
              revealText="My Learning Path"
              className="border-none shadow-none p-0 bg-transparent mb-8 sm:mb-10 md:mb-12 mx-auto text-center"
            />

            <div className="max-w-3xl mx-auto">
              <div className="relative pl-6 sm:pl-8 pb-8 sm:pb-12 border-l-2 border-primary/30 last:border-0">
                <MovingBorder className="p-0.5" containerClassName="absolute top-0 left-0 -translate-x-1/2 rounded-full" duration={5000}>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-background flex items-center justify-center">
                    <FaGraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                </MovingBorder>

                <BackgroundGradient className="rounded-xl">
                  <Card className="border-0 bg-background/80 backdrop-blur-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold">Kent Denver School</h3>
                      <span className="text-sm text-muted-foreground mt-1 sm:mt-0">2024 - 2028</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <MovingBorder className="p-0.5" containerClassName="rounded-md" duration={5000}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background rounded-md p-1 flex items-center justify-center">
                          <FaGraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                      </MovingBorder>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Sophomore</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Focus on Computer Science & Technology</p>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                      Actively involved in technology clubs and programming initiatives. Pursuing coursework in computer science, mathematics, and financial literacy.
                    </p>

                    <Link
                      href="https://www.kentdenver.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline text-sm sm:text-base"
                    >
                      <FaGlobeAmericas className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Visit School Website
                    </Link>
                  </Card>
                </BackgroundGradient>
              </div>
            </div>
          </div>
        </section>
      </LazyLoad>

      {/* Skills Section - Lazy loaded */}
      <LazyLoad className="relative overflow-hidden">
        <section className="py-10 sm:py-12 md:py-16">
          <Spotlight className="hidden md:block" />

          <div className="container relative z-10 px-4 sm:px-6">
            <TextRevealCard
              text="My Skills"
              revealText="Technologies & Expertise"
              className="border-none shadow-none p-0 bg-transparent mb-3 sm:mb-4 mx-auto text-center"
            />
            <p className="text-center text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12">
              I&apos;ve developed a diverse set of skills across various technologies and disciplines.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <ThreeDCard
                className="h-full w-full"
                rotationIntensity={5}
                glareOpacity={0.1}
                glareSize={0.4}
              >
                <SkillCard
                  icon={<SiHtml5 className="h-6 w-6" />}
                  title="HTML5"
                  level={90}
                />
              </ThreeDCard>

              <ThreeDCard
                className="h-full w-full"
                rotationIntensity={5}
                glareOpacity={0.1}
                glareSize={0.4}
              >
                <SkillCard
                  icon={<SiCss3 className="h-6 w-6" />}
                  title="CSS3"
                  level={85}
                />
              </ThreeDCard>

              <ThreeDCard
                className="h-full w-full"
                rotationIntensity={5}
                glareOpacity={0.1}
                glareSize={0.4}
              >
                <SkillCard
                  icon={<SiJavascript className="h-6 w-6" />}
                  title="JavaScript"
                  level={80}
                />
              </ThreeDCard>

              <ThreeDCard
                className="h-full w-full"
                rotationIntensity={5}
                glareOpacity={0.1}
                glareSize={0.4}
              >
                <SkillCard
                  icon={<SiPython className="h-6 w-6" />}
                  title="Python"
                  level={75}
                />
              </ThreeDCard>

              <ThreeDCard
                className="h-full w-full"
                rotationIntensity={5}
                glareOpacity={0.1}
                glareSize={0.4}
              >
                <SkillCard
                  icon={<SiAppwrite className="h-6 w-6" />}
                  title="Appwrite"
                  level={70}
                />
              </ThreeDCard>

              <ThreeDCard
                className="h-full w-full"
                rotationIntensity={5}
                glareOpacity={0.1}
                glareSize={0.4}
              >
                <SkillCard
                  icon={<SiReact className="h-6 w-6" />}
                  title="React"
                  level={85}
                />
              </ThreeDCard>

              <ThreeDCard
                className="h-full w-full"
                rotationIntensity={5}
                glareOpacity={0.1}
                glareSize={0.4}
              >
                <SkillCard
                  icon={<FaUniversalAccess className="h-6 w-6" />}
                  title="Accessibility"
                  level={85}
                />
              </ThreeDCard>

              <ThreeDCard
                className="h-full w-full"
                rotationIntensity={5}
                glareOpacity={0.1}
                glareSize={0.4}
              >
                <SkillCard
                  icon={<FaMobileAlt className="h-6 w-6" />}
                  title="Responsive Design"
                  level={90}
                />
              </ThreeDCard>

              <ThreeDCard
                className="h-full w-full"
                rotationIntensity={5}
                glareOpacity={0.1}
                glareSize={0.4}
              >
                <SkillCard
                  icon={<FaGraduationCap className="h-6 w-6" />}
                  title="Education"
                  level={95}
                />
              </ThreeDCard>
            </div>
          </div>
        </section>
      </LazyLoad>
    </>
  );
}

function SkillCard({ icon, title, level }: Readonly<{ icon: React.ReactNode, title: string, level: number }>) {
  return (
    <BackgroundGradient className="rounded-xl h-full">
      <Card className="overflow-hidden border-0 bg-background/80 backdrop-blur-sm h-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <MovingBorder className="p-0.5" containerClassName="rounded-md" duration={5000}>
              <div className="p-1.5 sm:p-2 rounded-md bg-background text-primary">
                {icon}
              </div>
            </MovingBorder>
            <h3 className="text-sm sm:text-base font-medium">{title}</h3>
          </div>

          <div className="w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out skill-progress-${level}`}
            ></div>
          </div>
          <div className="mt-1 sm:mt-2 text-right text-xs sm:text-sm text-muted-foreground">
            {level}%
          </div>
        </CardContent>
      </Card>
    </BackgroundGradient>
  );
}
