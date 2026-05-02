"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa6";

import { ProjectCard as GitHubProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import type { GitHubRepo, ProjectCard } from "@/lib/github";
import { transformRepoToProjectCard } from "@/lib/github";

const GITHUB_REPOS_URL = "https://api.github.com/users/JSB2010/repos?sort=updated&per_page=100";

export function GitHubProjectsSection() {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRepositories() {
      try {
        const response = await fetch(GITHUB_REPOS_URL, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = (await response.json()) as GitHubRepo[];
        const visibleProjects = repos
          .filter((repo) => !repo.fork && !repo.archived)
          .map(transformRepoToProjectCard);

        if (isMounted) {
          setProjects(visibleProjects);
          setHasError(false);
        }
      } catch (error) {
        console.error("Error fetching GitHub repositories:", error);
        if (isMounted) {
          setProjects([]);
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRepositories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-10 sm:py-14 md:py-20">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">GitHub Projects</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Open source contributions and personal repositories
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="border-primary/20 hover:bg-primary/5 text-xs sm:text-sm h-9 sm:h-10 mt-3 md:mt-0"
          >
            <Link href="https://github.com/JSB2010" target="_blank" rel="noopener noreferrer">
              <FaGithub className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              View All Repositories
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 rounded-xl border bg-card shadow-sm animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {projects.map((project) => (
              <GitHubProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="bg-card rounded-xl p-12 shadow-md text-center">
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
