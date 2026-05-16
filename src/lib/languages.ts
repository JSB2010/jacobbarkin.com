export interface LanguageConfig {
  slug: string;
  label: string;
  imagePath: string;
  color: string;
  softColor: string;
}

const languageConfigs: Record<string, LanguageConfig> = {
  javascript: {
    slug: "javascript",
    label: "JavaScript",
    imagePath: "/images/languages/javascript.svg",
    color: "#f0db4f",
    softColor: "rgba(240, 219, 79, 0.18)",
  },
  typescript: {
    slug: "typescript",
    label: "TypeScript",
    imagePath: "/images/languages/typescript.svg",
    color: "#3178c6",
    softColor: "rgba(49, 120, 198, 0.18)",
  },
  python: {
    slug: "python",
    label: "Python",
    imagePath: "/images/languages/python.svg",
    color: "#3776ab",
    softColor: "rgba(55, 118, 171, 0.18)",
  },
  java: {
    slug: "java",
    label: "Java",
    imagePath: "/images/languages/java.svg",
    color: "#e76f00",
    softColor: "rgba(231, 111, 0, 0.18)",
  },
  go: {
    slug: "go",
    label: "Go",
    imagePath: "/images/languages/go.svg",
    color: "#00add8",
    softColor: "rgba(0, 173, 216, 0.18)",
  },
  ruby: {
    slug: "ruby",
    label: "Ruby",
    imagePath: "/images/languages/ruby.svg",
    color: "#cc342d",
    softColor: "rgba(204, 52, 45, 0.18)",
  },
  php: {
    slug: "php",
    label: "PHP",
    imagePath: "/images/languages/php.svg",
    color: "#777bb3",
    softColor: "rgba(119, 123, 179, 0.18)",
  },
  c: {
    slug: "c",
    label: "C",
    imagePath: "/images/languages/c.svg",
    color: "#03599c",
    softColor: "rgba(3, 89, 156, 0.18)",
  },
  cpp: {
    slug: "cpp",
    label: "C++",
    imagePath: "/images/languages/cpp.svg",
    color: "#00599c",
    softColor: "rgba(0, 89, 156, 0.18)",
  },
  csharp: {
    slug: "csharp",
    label: "C#",
    imagePath: "/images/languages/csharp.svg",
    color: "#68217a",
    softColor: "rgba(104, 33, 122, 0.18)",
  },
  rust: {
    slug: "rust",
    label: "Rust",
    imagePath: "/images/languages/rust.svg",
    color: "#b7410e",
    softColor: "rgba(183, 65, 14, 0.18)",
  },
  swift: {
    slug: "swift",
    label: "Swift",
    imagePath: "/images/languages/swift.svg",
    color: "#f05138",
    softColor: "rgba(240, 81, 56, 0.18)",
  },
  kotlin: {
    slug: "kotlin",
    label: "Kotlin",
    imagePath: "/images/languages/kotlin.svg",
    color: "#7f52ff",
    softColor: "rgba(127, 82, 255, 0.18)",
  },
  dart: {
    slug: "dart",
    label: "Dart",
    imagePath: "/images/languages/dart.svg",
    color: "#0175c2",
    softColor: "rgba(1, 117, 194, 0.18)",
  },
  html: {
    slug: "html",
    label: "HTML",
    imagePath: "/images/languages/html.svg",
    color: "#e34c26",
    softColor: "rgba(227, 76, 38, 0.18)",
  },
  css: {
    slug: "css",
    label: "CSS",
    imagePath: "/images/languages/css.svg",
    color: "#264de4",
    softColor: "rgba(38, 77, 228, 0.18)",
  },
  sass: {
    slug: "sass",
    label: "Sass",
    imagePath: "/images/languages/sass.svg",
    color: "#cc6699",
    softColor: "rgba(204, 102, 153, 0.18)",
  },
  shell: {
    slug: "shell",
    label: "Shell",
    imagePath: "/images/languages/shell.svg",
    color: "#4eaa25",
    softColor: "rgba(78, 170, 37, 0.18)",
  },
  bash: {
    slug: "bash",
    label: "Bash",
    imagePath: "/images/languages/bash.svg",
    color: "#4eaa25",
    softColor: "rgba(78, 170, 37, 0.18)",
  },
  powershell: {
    slug: "powershell",
    label: "PowerShell",
    imagePath: "/images/languages/powershell.svg",
    color: "#5391fe",
    softColor: "rgba(83, 145, 254, 0.18)",
  },
  vue: {
    slug: "vue",
    label: "Vue",
    imagePath: "/images/languages/vue.svg",
    color: "#42b883",
    softColor: "rgba(66, 184, 131, 0.18)",
  },
  react: {
    slug: "react",
    label: "React",
    imagePath: "/images/languages/react.svg",
    color: "#61dafb",
    softColor: "rgba(97, 218, 251, 0.18)",
  },
  angular: {
    slug: "angular",
    label: "Angular",
    imagePath: "/images/languages/angular.svg",
    color: "#dd0031",
    softColor: "rgba(221, 0, 49, 0.18)",
  },
  svelte: {
    slug: "svelte",
    label: "Svelte",
    imagePath: "/images/languages/svelte.svg",
    color: "#ff3e00",
    softColor: "rgba(255, 62, 0, 0.18)",
  },
  node: {
    slug: "node",
    label: "Node",
    imagePath: "/images/languages/nodejs.svg",
    color: "#68a063",
    softColor: "rgba(104, 160, 99, 0.18)",
  },
  markdown: {
    slug: "markdown",
    label: "Markdown",
    imagePath: "/images/languages/markdown.svg",
    color: "#111827",
    softColor: "rgba(17, 24, 39, 0.14)",
  },
  json: {
    slug: "json",
    label: "JSON",
    imagePath: "/images/languages/json.svg",
    color: "#111827",
    softColor: "rgba(17, 24, 39, 0.14)",
  },
  yaml: {
    slug: "yaml",
    label: "YAML",
    imagePath: "/images/languages/yaml.svg",
    color: "#cb171e",
    softColor: "rgba(203, 23, 30, 0.16)",
  },
  r: {
    slug: "r",
    label: "R",
    imagePath: "/images/languages/r.svg",
    color: "#276dc3",
    softColor: "rgba(39, 109, 195, 0.18)",
  },
  julia: {
    slug: "julia",
    label: "Julia",
    imagePath: "/images/languages/julia.svg",
    color: "#a270ba",
    softColor: "rgba(162, 112, 186, 0.18)",
  },
};

const languageAliases: Record<string, keyof typeof languageConfigs> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  "jupyter notebook": "python",
  java: "java",
  golang: "go",
  rb: "ruby",
  "c++": "cpp",
  "c#": "csharp",
  "objective-c++": "cpp",
  "objective-c": "c",
  scss: "sass",
  less: "css",
  dockerfile: "shell",
  makefile: "shell",
  zsh: "shell",
  fish: "shell",
  sh: "shell",
  mdx: "markdown",
  yml: "yaml",
  vuejs: "vue",
  reactjs: "react",
  nodejs: "node",
  "node.js": "node",
};

export function getLanguageConfig(language: string | null): LanguageConfig | null {
  if (!language) {
    return null;
  }

  const normalized = language.trim().toLowerCase();
  const directConfig = languageConfigs[normalized];

  if (directConfig) {
    return directConfig;
  }

  const alias = languageAliases[normalized];

  if (alias) {
    return languageConfigs[alias];
  }

  return null;
}

export function getLanguageLabel(language: string | null): string {
  return getLanguageConfig(language)?.label ?? language ?? "Code";
}

export function getLanguageImagePath(language: string | null): string {
  return getLanguageConfig(language)?.imagePath ?? "/images/languages/patterns/tech-pattern.svg";
}

export function getLanguageColor(language: string | null): string {
  return getLanguageConfig(language)?.color ?? "#64748b";
}

export function getLanguageSoftColor(language: string | null): string {
  return getLanguageConfig(language)?.softColor ?? "rgba(100, 116, 139, 0.16)";
}
