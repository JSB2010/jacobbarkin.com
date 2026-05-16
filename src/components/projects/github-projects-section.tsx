"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa6";
import { ArrowDownAZ, CalendarClock, RefreshCw, SlidersHorizontal, Sparkles } from "lucide-react";

import { ProjectCard as GitHubProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import type { GitHubRepo, ProjectCard } from "@/lib/github";
import { transformRepoToProjectCard } from "@/lib/github";
import { getLanguageColor, getLanguageLabel } from "@/lib/languages";

const GITHUB_REPOS_URL = "https://api.github.com/users/JSB2010/repos?sort=updated&per_page=100";
const INITIAL_VISIBLE_PROJECTS = 9;

type SortMode = "updated" | "name";

function sortProjects(projects: ProjectCard[], sortMode: SortMode) {
  return [...projects].sort((firstProject, secondProject) => {
    if (sortMode === "name") {
      return firstProject.title.localeCompare(secondProject.title);
    }

    return new Date(secondProject.updatedAt).getTime() - new Date(firstProject.updatedAt).getTime();
  });
}

function formatRepositoryTitle(title: string) {
  return title
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getLanguageOptions(projects: ProjectCard[]) {
  const languageCounts = new Map<string, { count: number; color: string; originalLanguage: string | null }>();

  projects.forEach((project) => {
    const label = getLanguageLabel(project.language);
    const current = languageCounts.get(label);

    languageCounts.set(label, {
      count: (current?.count ?? 0) + 1,
      color: current?.color ?? getLanguageColor(project.language),
      originalLanguage: current?.originalLanguage ?? project.language,
    });
  });

  return [...languageCounts.entries()]
    .map(([label, value]) => ({ label, ...value }))
    .sort((firstLanguage, secondLanguage) => {
      if (secondLanguage.count !== firstLanguage.count) {
        return secondLanguage.count - firstLanguage.count;
      }

      return firstLanguage.label.localeCompare(secondLanguage.label);
    });
}

export function GitHubProjectsSection() {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [sortMode, setSortMode] = useState<SortMode>("updated");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepositories() {
      try {
        const response = await fetch(GITHUB_REPOS_URL, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = (await response.json()) as GitHubRepo[];
        const visibleProjects = repos
          .filter((repo) => !repo.fork && !repo.archived)
          .map(transformRepoToProjectCard);

        setProjects(visibleProjects);
        setHasError(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Error fetching GitHub repositories:", error);
        setProjects([]);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadRepositories();

    return () => {
      controller.abort();
    };
  }, []);

  const languageOptions = useMemo(() => getLanguageOptions(projects), [projects]);
  const featuredTopics = useMemo(() => {
    const topicCounts = new Map<string, number>();

    projects.forEach((project) => {
      project.topics.forEach((topic) => {
        topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
      });
    });

    return [...topicCounts.entries()]
      .sort((firstTopic, secondTopic) => secondTopic[1] - firstTopic[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }, [projects]);
  const filteredProjects = useMemo(() => {
    const languageFilteredProjects =
      activeLanguage === "All"
        ? projects
        : projects.filter((project) => getLanguageLabel(project.language) === activeLanguage);

    return sortProjects(languageFilteredProjects, sortMode);
  }, [activeLanguage, projects, sortMode]);
  const visibleProjects = showAllProjects
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_VISIBLE_PROJECTS);
  const newestProject = filteredProjects[0];
  const primaryLanguage = languageOptions[0];

  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="container px-4 sm:px-6">
        <div className="mb-8 overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm sm:mb-10">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="relative overflow-hidden p-5 sm:p-7 md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(var(--primary-rgb),0.14),transparent_32%),linear-gradient(135deg,rgba(var(--primary-rgb),0.06),rgba(var(--accent-rgb),0.08))]" />
              <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-primary/15 bg-background/75 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                    <FaGithub className="h-3.5 w-3.5" />
                    Live from GitHub
                  </div>
                  <h2 className="text-2xl font-bold tracking-normal sm:text-3xl md:text-4xl">
                    GitHub Projects
                  </h2>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="h-10 w-fit border-primary/25 bg-background/80 text-sm hover:bg-primary/5"
                >
                  <Link href="https://github.com/JSB2010" target="_blank" rel="noopener noreferrer">
                    <FaGithub className="mr-2 h-4 w-4" />
                    View GitHub
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-border/60 bg-muted/30 text-center lg:grid-cols-1 lg:border-l lg:border-t-0">
              <div className="p-4 lg:p-5">
                <div className="text-xl font-semibold sm:text-2xl">{projects.length || "--"}</div>
                <div className="mt-1 text-xs text-muted-foreground">Repos</div>
              </div>
              <div className="border-l border-border/60 p-4 lg:border-l-0 lg:border-t lg:p-5">
                <div className="text-xl font-semibold sm:text-2xl">{languageOptions.length || "--"}</div>
                <div className="mt-1 text-xs text-muted-foreground">Languages</div>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[25rem] rounded-lg border bg-card shadow-sm animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="rounded-lg border border-border/60 bg-card p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Language
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveLanguage("All");
                      setShowAllProjects(false);
                    }}
                    className={`h-8 rounded-md border px-3 text-xs font-medium transition-colors ${
                      activeLanguage === "All"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    All {projects.length}
                  </button>
                  {languageOptions.map((language) => (
                    <button
                      key={language.label}
                      type="button"
                      onClick={() => {
                        setActiveLanguage(language.label);
                        setShowAllProjects(false);
                      }}
                      className={`inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors ${
                        activeLanguage === language.label
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: language.color }}
                      />
                      {language.label} {language.count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-card p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Sort
                </div>
                <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                  {[
                    { value: "updated", label: "Updated", icon: CalendarClock },
                    { value: "name", label: "Name", icon: ArrowDownAZ },
                  ].map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSortMode(option.value as SortMode)}
                        className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors lg:justify-start ${
                          sortMode === option.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {newestProject && (
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Newest Activity
                  </div>
                  <div className="mt-2 truncate text-sm font-semibold">{formatRepositoryTitle(newestProject.title)}</div>
                </div>
              )}
              {primaryLanguage && (
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Top Language
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryLanguage.color }} />
                    {primaryLanguage.label}
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Topics
                </div>
                <div className="mt-2 truncate text-sm font-semibold">
                  {featuredTopics.length > 0 ? featuredTopics.join(", ") : "No topics yet"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project) => (
                <GitHubProjectCard key={project.id} project={project} />
              ))}
            </div>

            {filteredProjects.length > INITIAL_VISIBLE_PROJECTS && (
              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAllProjects((currentValue) => !currentValue)}
                  className="border-primary/25"
                >
                  {showAllProjects
                    ? "Show fewer repositories"
                    : `Show ${filteredProjects.length - INITIAL_VISIBLE_PROJECTS} more repositories`}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <div className="bg-card rounded-lg border border-border/60 p-8 shadow-sm text-center sm:p-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaGithub className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">GitHub Repositories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                {hasError
                  ? "We couldn't fetch your GitHub repositories at this time. Please check back later."
                  : "No public repositories are available right now."}
              </p>
              <Button asChild size="lg">
                <Link href="https://github.com/JSB2010" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="mr-2 h-5 w-5" />
                  Visit My GitHub
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
