const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

const root = process.cwd();
const projectsPagePath = join(root, "src/app/projects/page.tsx");
const githubSectionPath = join(root, "src/components/projects/github-projects-section.tsx");
const githubLibPath = join(root, "src/lib/github.ts");
const nextConfigPath = join(root, "next.config.mjs");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(existsSync(projectsPagePath), "Projects page is missing");
assert(existsSync(githubSectionPath), "GitHub projects client section is missing");

const projectsPage = readFileSync(projectsPagePath, "utf8");
const githubSection = readFileSync(githubSectionPath, "utf8");
const githubLib = readFileSync(githubLibPath, "utf8");
const nextConfig = readFileSync(nextConfigPath, "utf8");

assert(
  !projectsPage.includes("fetchUserRepositories"),
  "Projects page should not fetch GitHub repositories during server render"
);
assert(
  projectsPage.includes("GitHubProjectsSection"),
  "Projects page must render the GitHub projects client section"
);
assert(
  githubSection.includes('"use client"') &&
    githubSection.includes("https://api.github.com/users/JSB2010/repos") &&
    githubSection.includes("transformRepoToProjectCard"),
  "GitHub projects section must fetch GitHub repos client-side and transform them into cards"
);
assert(
  githubSection.includes("We couldn't fetch your GitHub repositories"),
  "GitHub projects section must keep the explicit failure state"
);
assert(nextConfig.includes("https://api.github.com"), "CSP must allow client-side GitHub API requests");
assert(
  githubLib.includes("repo.homepage?.trim() ? repo.homepage : repo.html_url"),
  "GitHub project links must fall back to GitHub when homepage is empty"
);

console.log("Projects GitHub repository loading is client-side and CSP-compatible.");
