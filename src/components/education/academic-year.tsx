"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BackgroundGradient } from "@/components/ui/aceternity/background-gradient";
import { MovingBorder } from "@/components/ui/aceternity/moving-border";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  FaGraduationCap,
  FaBook,
  FaRunning,
  FaUsers,
  FaNewspaper,
  FaChalkboardTeacher,
  FaCode,
  FaLanguage,
  FaCalculator,
  FaFlask,
  FaGlobe,
  FaHistory,
  FaCamera,
  FaBalanceScale
} from "react-icons/fa";
import { ThreeDCard } from "@/components/ui/aceternity/3d-card";

// Types for the component props
export interface Class {
  name: string;
  icon?: React.ReactNode;
}

export interface Sport {
  name: string;
  icon?: React.ReactNode;
}

export interface ExtraCurricular {
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface AcademicYearProps {
  year: string;
  yearLabel: string;
  classes: Class[];
  sports: Sport[];
  extraCurriculars: ExtraCurricular[];
  defaultOpen?: boolean;
}

// Helper function to get an appropriate icon for a class based on its name
const getClassIcon = (className: string) => {
  const lowerName = className.toLowerCase();

  if (lowerName.includes("calculus") || lowerName.includes("algebra") || lowerName.includes("math") || lowerName.includes("precalculus")) {
    return <FaCalculator className="h-5 w-5" />;
  } else if (lowerName.includes("english") || lowerName.includes("journalism")) {
    return <FaBook className="h-5 w-5" />;
  } else if (lowerName.includes("chemistry") || lowerName.includes("biology") || lowerName.includes("science")) {
    return <FaFlask className="h-5 w-5" />;
  } else if (lowerName.includes("history") || lowerName.includes("world") || lowerName.includes("policy") || lowerName.includes("debate")) {
    return <FaBalanceScale className="h-5 w-5" />;
  } else if (lowerName.includes("spanish") || lowerName.includes("language")) {
    return <FaLanguage className="h-5 w-5" />;
  } else if (lowerName.includes("computer") || lowerName.includes("cs")) {
    return <FaCode className="h-5 w-5" />;
  } else if (lowerName.includes("photography")) {
    return <FaCamera className="h-5 w-5" />;
  } else {
    return <FaChalkboardTeacher className="h-5 w-5" />;
  }
};

export function AcademicYear({ year, yearLabel, classes, sports, extraCurriculars, defaultOpen = false }: AcademicYearProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  // Create a unique ID for this accordion based on the year
  const accordionId = `year-${year.replace(/\s+/g, '-')}`;

  // Handle accordion state change
  const handleAccordionChange = (value: string | undefined) => {
    setIsOpen(value === accordionId);
  };

  return (
    <div className="relative pl-6 sm:pl-8 pb-8 sm:pb-12 border-l-2 border-primary/30 last:border-0">
      <MovingBorder
        className="p-0.5"
        containerClassName="absolute top-0 left-0 -translate-x-1/2 rounded-full"
        duration={5000}
      >
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${isOpen ? 'bg-primary/20' : 'bg-background'} flex items-center justify-center transition-colors duration-300`}>
          <FaGraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
        </div>
      </MovingBorder>

      <BackgroundGradient className="rounded-xl">
        <Card className={`border-0 bg-background/80 backdrop-blur-sm transition-shadow duration-300 relative z-10 ${isOpen ? 'shadow-lg' : 'shadow-md'}`}>
          <CardContent className="p-4 sm:p-6 relative z-10">
            <Accordion
              type="single"
              collapsible
              defaultValue={defaultOpen ? accordionId : undefined}
              onValueChange={handleAccordionChange}
            >
              <AccordionItem value={accordionId} className="border-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <AccordionTrigger className="py-2 hover:no-underline w-full">
                    <div className="flex items-center gap-3 w-full">
                      <MovingBorder className="p-0.5" containerClassName="rounded-md" duration={5000}>
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${isOpen ? 'bg-primary/10' : 'bg-background'} rounded-md p-1 flex items-center justify-center transition-colors duration-300`}>
                          <FaGraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                      </MovingBorder>
                      <div className="text-left flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold">{year}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{yearLabel}</p>
                      </div>
                      <div className="hidden sm:flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        {isOpen ? 'Click to collapse' : 'Click to expand'}
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>

                <AccordionContent className="pt-4">
                  <div className="space-y-6">
                    {/* Classes Section */}
                    <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                      <h4 className="text-base sm:text-lg font-medium mb-4 flex items-center gap-2 pb-2 border-b border-border/30">
                        <FaBook className="h-4 w-4 text-primary" />
                        <span>Classes</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {classes.map((cls, index) => (
                          <div
                            key={`class-${index}`}
                            className="flex items-center gap-2 p-3 rounded-lg bg-background/80 hover:bg-background transition-colors shadow-sm hover:shadow border border-border/20 hover:border-primary/20"
                          >
                            <div className="p-1.5 rounded-md bg-primary/10 flex items-center justify-center">
                              {cls.icon || getClassIcon(cls.name)}
                            </div>
                            <span className="text-sm font-medium">{cls.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sports Section */}
                    {sports.length > 0 && (
                      <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                        <h4 className="text-base sm:text-lg font-medium mb-4 flex items-center gap-2 pb-2 border-b border-border/30">
                          <FaRunning className="h-4 w-4 text-primary" />
                          <span>Sports</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {sports.map((sport, index) => (
                            <div
                              key={`sport-${index}`}
                              className="flex items-center gap-2 p-3 rounded-lg bg-background/80 hover:bg-background transition-colors shadow-sm hover:shadow border border-border/20 hover:border-primary/20"
                            >
                              <div className="p-1.5 rounded-md bg-primary/10 flex items-center justify-center">
                                {sport.icon || <FaRunning className="h-5 w-5" />}
                              </div>
                              <span className="text-sm font-medium">{sport.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extra Curriculars Section */}
                    {extraCurriculars.length > 0 && (
                      <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                        <h4 className="text-base sm:text-lg font-medium mb-4 flex items-center gap-2 pb-2 border-b border-border/30">
                          <FaUsers className="h-4 w-4 text-primary" />
                          <span>Extra Curriculars</span>
                        </h4>
                        <div className="space-y-3">
                          {extraCurriculars.map((activity, index) => (
                            <div
                              key={`activity-${index}`}
                              className="p-3 rounded-lg bg-background/80 hover:bg-background transition-colors shadow-sm hover:shadow border border-border/20 hover:border-primary/20"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-primary/10 flex items-center justify-center">
                                  {activity.icon || <FaUsers className="h-5 w-5" />}
                                </div>
                                <span className="font-medium">{activity.name}</span>
                              </div>
                              {activity.description && (
                                <p className="text-xs sm:text-sm text-muted-foreground ml-10 pl-2 border-l-2 border-primary/20">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </BackgroundGradient>
    </div>
  );
}
