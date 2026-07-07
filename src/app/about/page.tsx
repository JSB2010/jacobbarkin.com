import { Metadata } from "next";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
// Import actual programming language and technology icons
import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiPython,
  SiAppwrite,
  SiReact,
  SiFirebase,
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiGooglecloud,
  SiCloudflare
} from "react-icons/si";

// Import additional icon sets for technologies that might not be in simple-icons
import { FaUniversalAccess, FaGraduationCap, FaGlobeAmericas, FaBriefcase, FaUsers, FaLaptopCode, FaLinkedin, FaServer, FaUserShield } from "react-icons/fa";

// Import Aceternity UI components
import { BackgroundGradient } from "@/components/ui/aceternity/background-gradient";
import { MovingBorder } from "@/components/ui/aceternity/moving-border";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { TextRevealCard } from "@/components/ui/aceternity/text-reveal-card";
import { GradientSkillsContainer } from "@/components/ui/aceternity/gradient-skills-container";
import { PageHero } from "@/components/ui/page-hero";
import { LazyLoad } from "@/components/ui/lazy-load";
import { Button } from "@/components/ui/button";

// Import Education Section component
import { EducationSection } from "@/components/education/education-section";

export const metadata: Metadata = {
  title: "About Me | Jacob Barkin",
  description: "Learn more about Jacob Barkin, my background, education, and skills in technology and financial education.",
  alternates: {
    canonical: "https://jacobbarkin.com/about",
  },
  openGraph: {
    title: "About Me | Jacob Barkin",
    description: "Learn more about Jacob Barkin, my background, education, and skills in technology and financial education.",
    url: "https://jacobbarkin.com/about",
    siteName: "Jacob Barkin Portfolio",
    images: [
      {
        url: "/images/Updated logo.png",
        width: 800,
        height: 600,
        alt: "Jacob Barkin Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Me | Jacob Barkin",
    description: "Learn more about Jacob Barkin, my background, education, and skills in technology and financial education.",
    images: ["/images/Updated logo.png"],
    creator: "@jacobbarkin",
    site: "@jacobbarkin",
  },
};

export default function AboutPage() {
  const skills = [
    { title: "HTML5", icon: <SiHtml5 className="h-6 w-6" /> },
    { title: "CSS3", icon: <SiCss className="h-6 w-6" /> },
    { title: "JavaScript", icon: <SiJavascript className="h-6 w-6" /> },
    { title: "TypeScript", icon: <SiTypescript className="h-6 w-6" /> },
    { title: "Python", icon: <SiPython className="h-6 w-6" /> },
    { title: "React", icon: <SiReact className="h-6 w-6" /> },
    { title: "Next.js", icon: <SiNextdotjs className="h-6 w-6" /> },
    { title: "Tailwind CSS", icon: <SiTailwindcss className="h-6 w-6" /> },
    { title: "Firebase", icon: <SiFirebase className="h-6 w-6" /> },
    { title: "Google Cloud", icon: <SiGooglecloud className="h-6 w-6" /> },
    { title: "Appwrite", icon: <SiAppwrite className="h-6 w-6" /> },
    { title: "Cloudflare Workers", icon: <SiCloudflare className="h-6 w-6" /> },
    { title: "AI Integration", icon: <FaLaptopCode className="h-6 w-6" /> },
    { title: "VM Management", icon: <FaServer className="h-6 w-6" /> },
    { title: "Accessibility", icon: <FaUniversalAccess className="h-6 w-6" /> },
    { title: "User Data Protection", icon: <FaUserShield className="h-6 w-6" /> }
  ];

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="About Me"
        description="I'm Jacob Barkin, a student developer passionate about technology, financial education, and making a positive impact through accessible solutions."
        backgroundImage="/images/mountains-bg.jpg"
        tags={["Developer", "Student", "Journalism", "Financial Education", "Accessibility"]}
      />

      {/* Bio Section */}
      <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
        <Spotlight className="hidden md:block" />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative aspect-square max-w-xs sm:max-w-sm md:max-w-md mx-auto md:mx-0 rounded-2xl overflow-hidden">
              <BackgroundGradient className="rounded-2xl h-full">
                <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
                  <img
                    src="/images/optimized/Jacob Boreas.webp"
                    alt="Jacob Barkin"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay"></div>
                </div>
              </BackgroundGradient>
            </div>

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
                  Beyond technology, I&apos;m deeply committed to financial education and literacy for youth. As a Youth Advisory Board Member at Young Americans Center For Financial Education, I work to promote financial literacy and help young people develop essential money management skills. I believe that understanding personal finance is a critical life skill that should be accessible to everyone, especially young people who are just beginning to navigate the financial world.
                </p>
                <p>
                  I&apos;m also interested in public transportation systems and their impact on communities. I research and advocate for improved public transit, focusing on accessibility and sustainability.
                </p>
                <p>
                  In journalism, I served as a staff writer for The Sun Devil&apos;s Advocate (the Advocate) in 2025 and now edit the news section for 2026. I love reporting and writing stories that keep the school community informed.
                </p>
                <p>
                  Through my projects and initiatives, I aim to combine these interests to create meaningful solutions that help people learn, grow, and navigate both the technological and financial aspects of the modern world more effectively.
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
            <div className="flex flex-col items-center mb-8 sm:mb-10">
              <TextRevealCard
                text="Education"
                revealText="My Learning Path"
                className="border-none shadow-none p-0 bg-transparent mx-auto text-center"
              />
              <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mt-3 sm:mt-4 mb-4"></div>

              <div className="flex items-center justify-center bg-muted/30 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                <FaGraduationCap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                <span className="text-sm sm:text-base font-medium">Kent Denver School</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-xs sm:text-sm text-muted-foreground">High School</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-xs sm:text-sm text-muted-foreground">2024-2028</span>
                <a
                  href="https://kentdenver.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-primary hover:text-primary/80 transition-colors"
                  aria-label="Visit Kent Denver School website"
                >
                  <FaGlobeAmericas className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>

            {/* Education Section component */}
            <div className="max-w-3xl mx-auto">
              <EducationSection />
            </div>
          </div>
        </section>
      </LazyLoad>

      {/* Work Experience Section - Lazy loaded */}
      <LazyLoad className="relative overflow-hidden">
        <section className="py-10 sm:py-12 md:py-16">
          <div className="container relative z-10 px-4 sm:px-6">
            <TextRevealCard
              text="Work Experience"
              revealText="Professional Journey"
              className="border-none shadow-none p-0 bg-transparent mb-8 sm:mb-10 md:mb-12 mx-auto text-center"
            />

            <div className="max-w-3xl mx-auto space-y-8">
              {/* IT Student Employee */}
              <div className="relative pl-6 sm:pl-8 pb-8 sm:pb-12 border-l-2 border-primary/30">
                <MovingBorder className="p-0.5" containerClassName="absolute top-0 left-0 -translate-x-1/2 rounded-full" duration={5000}>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-background flex items-center justify-center">
                    <FaBriefcase className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                </MovingBorder>

                <BackgroundGradient className="rounded-xl">
                  <Card className="border-0 bg-background/80 backdrop-blur-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold">Kent Denver School</h3>
                      <span className="text-sm text-muted-foreground mt-1 sm:mt-0">2025 - Present</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <MovingBorder className="p-0.5" containerClassName="rounded-md" duration={5000}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background rounded-md p-1 flex items-center justify-center">
                          <FaLaptopCode className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                      </MovingBorder>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Information Technology Student Employee</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Software Development & IT Support</p>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                      I am working on many projects for Kent Denver to improve student experience and make it easy for people to do their work. This includes:
                    </p>

                    <ul className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 space-y-2 ml-4">
                      <li className="flex gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>A robust emergency management app that allows administrators to activate all of the proper emergency protocols in one, easy to use, comprehensive solution. This includes activating our PA system to announce the situation, setting digital signage to display important messages, controlling our Access Control system to properly lock or open doors, and contacting parents and the wider community about what is happening</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>An inventory management solution for our school&apos;s maker space built on Snipe-IT</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>A chatbot for students and faculty which allows them to interact with our LMS, Canvas, and making it easier to learn about what they need to do</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>A beta version of a comment writer that allows teachers to write personalized comments for students using AI instead of using copy-pasted templates</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>An intuitive app for grounds, custodial, and maintenance employees to view, update and check tickets in our school&apos;s Freshdesk ticketing solution</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>An in-progress integration with Canvas for the Secure Exam Browser to be able to directly integrate Canvas quizzes into SEB for easier student and instructor workflows</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>A Gmail add-on that enhances and improves the functionality of our school&apos;s soft phone system by allowing users to set Do Not Disturb schedules, view directories with all extensions, and click-to-call functionality for easier dialing</span>
                      </li>
                    </ul>

                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                      In addition to this, I have also done tech support for students and employees, and have helped set up new devices for them.
                    </p>

                    <p className="text-sm sm:text-base text-muted-foreground">
                      Through this job, I have learned so much about the complexities and inner-workings of an IT department, and I have learned how to use so many different technologies. I have gotten more adept at troubleshooting and solving problems, and finding solutions to make the user experience better.
                    </p>
                  </Card>
                </BackgroundGradient>
              </div>

              {/* Youth Advisory Board */}
              <div className="relative pl-6 sm:pl-8 pb-8 sm:pb-12 border-l-2 border-primary/30 last:border-0">
                <MovingBorder className="p-0.5" containerClassName="absolute top-0 left-0 -translate-x-1/2 rounded-full" duration={5000}>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-background flex items-center justify-center">
                    <FaBriefcase className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                </MovingBorder>

                <BackgroundGradient className="rounded-xl">
                  <Card className="border-0 bg-background/80 backdrop-blur-sm p-4 sm:p-6 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold">Young Americans Center For Financial Education</h3>
                      <span className="text-sm text-muted-foreground mt-1 sm:mt-0">2024 - Present</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <MovingBorder className="p-0.5" containerClassName="rounded-md" duration={5000}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background rounded-md p-1 flex items-center justify-center">
                          <FaUsers className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                      </MovingBorder>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Youth Advisory Board Member</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Financial Education & Leadership</p>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                      As a member of the Youth Advisory Board, I provide insights and perspectives on banking products, services, and programs designed for young people. I collaborate with a diverse group of students from across Colorado to advise Young Americans Bank and the nonprofit programs of Young Americans Center for Financial Education. This role has allowed me to develop skills in leadership, business etiquette, and financial literacy while serving as an ambassador for the organization at special events and functions.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-20">
                      <a
                        href="https://yacenter.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline text-sm sm:text-base cursor-pointer"
                      >
                        <FaGlobeAmericas className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Visit Organization Website
                      </a>

                      <a
                        href="https://yacenter.org/about-us/youth-board/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline text-sm sm:text-base cursor-pointer"
                      >
                        <FaUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Learn About the Youth Board
                      </a>
                    </div>
                  </Card>
                </BackgroundGradient>
              </div>
            </div>

            <div className="flex justify-center mt-8 sm:mt-10">
              <Button asChild variant="outline" className="gap-2">
                <a
                  href="https://www.linkedin.com/in/jacobbarkin/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="h-4 w-4" />
                  View more job experience on LinkedIn
                </a>
              </Button>
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

            <GradientSkillsContainer columns={4} rows={4}>
              {skills.map((skill) => (
                <SkillCard key={skill.title} icon={skill.icon} title={skill.title} />
              ))}
            </GradientSkillsContainer>
          </div>
        </section>
      </LazyLoad>
    </>
  );
}

function SkillCard({
  icon,
  title,
}: Readonly<{
  icon: React.ReactNode,
  title: string,
}>) {
  return (
    <Card className="h-full border border-border/60 bg-background/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40">
      <CardContent className="p-5 sm:p-6 flex flex-col items-center text-center gap-3 sm:gap-4">
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary/15 via-primary/10 to-secondary/15 text-primary ring-1 ring-primary/20">
          <div className="flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7">
            {icon}
          </div>
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-foreground">
          {title}
        </h3>
        <div className="w-10 h-1 bg-primary/30 rounded-full"></div>
      </CardContent>
    </Card>
  );
}
