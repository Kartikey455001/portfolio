import { env } from "../../config/env.js";
import { githubRepositorySchema, githubUserSchema } from "../../validators/schemas.js";
import { AppError } from "../../utils/app-error.js";
import type { GitHubRepository, GitHubUser } from "../../types/domain.js";

const API = "https://api.github.com";
const timeout = 12_000;

export class GitHubService {
  private headers(accept = "application/vnd.github+json") {
    return {
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "kartikey-portfolio-api",
      ...(env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {}),
    };
  }

  private username(username?: string) {
    const value = username?.trim() || env.githubUsername;
    if (!value) throw new AppError(503, "INTEGRATION_NOT_CONFIGURED", "Set GITHUB_USERNAME to enable GitHub synchronization");
    return value;
  }

  async getUserProfile(username?: string): Promise<GitHubUser> {
    const response = await fetch(`${API}/users/${encodeURIComponent(this.username(username))}`, { headers: this.headers(), signal: AbortSignal.timeout(timeout) });
    if (!response.ok) throw new AppError(502, "GITHUB_PROVIDER_ERROR", `GitHub profile request failed (${response.status})`);
    const user = githubUserSchema.parse(await response.json());
    return { login: user.login, name: user.name, bio: user.bio, avatarUrl: user.avatar_url, htmlUrl: user.html_url, publicRepos: user.public_repos, followers: user.followers, following: user.following };
  }

  async getRepositories(username?: string): Promise<GitHubRepository[]> {
    const account = this.username(username);
    const repositories: GitHubRepository[] = [];
    for (let page = 1; page <= 5; page += 1) {
      const url = new URL(`${API}/users/${encodeURIComponent(account)}/repos`);
      url.searchParams.set("sort", "updated");
      url.searchParams.set("direction", "desc");
      url.searchParams.set("per_page", "100");
      url.searchParams.set("page", String(page));
      const response = await fetch(url, { headers: this.headers(), signal: AbortSignal.timeout(timeout) });
      if (!response.ok) throw new AppError(502, "GITHUB_PROVIDER_ERROR", `GitHub repositories request failed (${response.status})`);
      const raw = await response.json();
      if (!Array.isArray(raw)) throw new AppError(502, "GITHUB_INVALID_RESPONSE", "GitHub returned an invalid repository list");
      const parsed = raw.map((entry) => githubRepositorySchema.parse(entry));
      repositories.push(...parsed.map((repo) => ({
        id: repo.id, name: repo.name, fullName: repo.full_name, description: repo.description, htmlUrl: repo.html_url,
        homepage: repo.homepage, language: repo.language, topics: repo.topics, stars: repo.stargazers_count, forks: repo.forks_count,
        updatedAt: repo.updated_at, owner: repo.owner.login, defaultBranch: repo.default_branch,
      })));
      if (parsed.length < 100) break;
    }
    return repositories;
  }

  async getRepository(owner: string, repository: string): Promise<GitHubRepository> {
    const response = await fetch(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`, { headers: this.headers(), signal: AbortSignal.timeout(timeout) });
    if (response.status === 404) throw new AppError(404, "NOT_FOUND", "GitHub repository not found");
    if (!response.ok) throw new AppError(502, "GITHUB_PROVIDER_ERROR", `GitHub repository request failed (${response.status})`);
    const repo = githubRepositorySchema.parse(await response.json());
    return { id: repo.id, name: repo.name, fullName: repo.full_name, description: repo.description, htmlUrl: repo.html_url, homepage: repo.homepage, language: repo.language, topics: repo.topics, stars: repo.stargazers_count, forks: repo.forks_count, updatedAt: repo.updated_at, owner: repo.owner.login, defaultBranch: repo.default_branch };
  }

  async getReadme(owner: string, repository: string): Promise<string> {
    const response = await fetch(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/readme`, { headers: this.headers("application/vnd.github.raw+json"), signal: AbortSignal.timeout(timeout) });
    if (response.status === 404) return "";
    if (!response.ok) throw new AppError(502, "GITHUB_PROVIDER_ERROR", `GitHub README request failed (${response.status})`);
    return (await response.text()).slice(0, 20_000);
  }
}

export const githubService = new GitHubService();
