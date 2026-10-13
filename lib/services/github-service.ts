import { demoProjects, type Project } from "../portfolio-data";

export type GitHubRepository = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  homepage: string | null;
};

export type GithubServiceResult = {
  projects: Project[];
  source: "demo" | "github";
};

function toProject(repo: GitHubRepository): Project {
  return {
    id: String(repo.id),
    name: repo.name.replaceAll("-", " "),
    description: repo.description ?? "A project built with curiosity and care.",
    tags: [repo.language, ...repo.topics].filter((value): value is string => Boolean(value)).slice(0, 4),
    mark: repo.name.slice(0, 1).toUpperCase(),
    kind: "fullstack",
    image: "/images/kartikey-portrait.jpg",
    tagline: repo.description ?? "Full-stack project",
    bullets: [repo.description ?? "Built with modern web technologies."],
    repositoryUrl: repo.html_url,
    demoUrl: repo.homepage || undefined,
    language: repo.language ?? undefined,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics,
    updatedAt: new Date(repo.updated_at).toLocaleDateString(undefined, { month: "short", year: "numeric" }),
  };
}

export async function loadProjects(username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "Kartikey455001"): Promise<GithubServiceResult> {
  try {
    if (!username?.trim()) return { projects: demoProjects, source: "demo" };

    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username.trim())}/repos?sort=updated&per_page=12`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return { projects: demoProjects, source: "demo" };
    const repositories = await response.json() as GitHubRepository[];
    if (!Array.isArray(repositories) || repositories.length === 0) {
      return { projects: demoProjects, source: "demo" };
    }
    // Keep our featured NutriZen and MYGPT as top spotlight projects
    return { projects: demoProjects, source: "demo" };
  } catch {
    return { projects: demoProjects, source: "demo" };
  }
}

export async function loadReadme(repositoryUrl: string): Promise<string> {
  const match = repositoryUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)/i);
  if (!match) return "";
  const [, owner, name] = match;
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/readme`, {
    headers: { Accept: "application/vnd.github.raw+json" },
  });
  if (!response.ok) throw new Error(`README returned ${response.status}`);
  return (await response.text()).slice(0, 3500);
}
