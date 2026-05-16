"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectCard as ProjectCardType } from "@/lib/github";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarClock, Code2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { GitHubProjectThumbnail } from "@/components/github-project-thumbnails";
import { trackEvent } from "@/lib/analytics";
import { getLanguageColor, getLanguageLabel, getLanguageSoftColor } from "@/lib/languages";

interface ProjectCardProps {
  project: ProjectCardType;
}

function formatRepositoryTitle(title: string) {
  return title
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function ProjectCard({ project }: Readonly<ProjectCardProps>) {
  const {
    title,
    description,
    image,
    language,
    url,
    githubUrl,
    updatedAt,
    topics,
    isArchived,
  } = project;

  const displayTitle = useMemo(() => formatRepositoryTitle(title), [title]);
  const updatedTimeAgo = useMemo(
    () => formatDistanceToNow(new Date(updatedAt), { addSuffix: true }),
    [updatedAt],
  );
  const languageLabel = getLanguageLabel(language);
  const languageColor = getLanguageColor(language);
  const languageSoftColor = getLanguageSoftColor(language);
  const hasLiveUrl = url !== githubUrl;

  const handleProjectClick = (destination: "project" | "github") => {
    void trackEvent("github_project_click", {
      project_name: title,
      project_url: destination === "project" ? url : githubUrl,
      destination,
    });
  };

  return (
    <Card className="group flex h-full overflow-hidden border-border/60 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
      <div className="flex h-full w-full flex-col">
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleProjectClick("project")}
          className="relative block h-40 overflow-hidden sm:h-44"
          aria-label={`Open ${displayTitle}`}
        >
          {image ? (
            <Image
              src={image}
              alt={displayTitle}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <GitHubProjectThumbnail
              language={language}
              title={title}
              className="transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
        </Link>

        <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-lg font-semibold leading-tight tracking-normal group-hover:text-primary">
                {displayTitle}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {language && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-foreground"
                    style={{ backgroundColor: languageSoftColor }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: languageColor }}
                    />
                    {languageLabel}
                  </span>
                )}
                {isArchived && (
                  <Badge variant="outline" className="h-6 border-muted-foreground/30 px-2 text-xs text-muted-foreground">
                    Archived
                  </Badge>
                )}
              </div>
            </div>
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <p className="mb-4 min-h-10 text-sm leading-6 text-muted-foreground line-clamp-2">
            {description ?? "No description available yet."}
          </p>

          {topics.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {topics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                >
                  {topic}
                </span>
              ))}
              {topics.length > 4 && (
                <span className="rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground">
                  +{topics.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              Updated {updatedTimeAgo}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleProjectClick("github")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Code2 className="h-3.5 w-3.5" />
              Code
            </Link>
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleProjectClick("project")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hasLiveUrl ? "Live" : "Repo"}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
