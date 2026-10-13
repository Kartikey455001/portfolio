import { afterEach, describe, expect, it, vi } from "vitest";
import { GitHubService } from "../src/services/github/githubService.js";

afterEach(() => vi.unstubAllGlobals());

function repo(id: number) {
  return { id, name: `project-${id}`, full_name: `sample/project-${id}`, description: null, html_url: `https://github.com/sample/project-${id}`, homepage: null, language: "TypeScript", topics: [], stargazers_count: 1, forks_count: 0, updated_at: "2026-01-01T00:00:00.000Z", owner: { login: "sample" }, default_branch: "main" };
}

describe("GitHub REST adapter", () => {
  it("paginates through public repositories and normalizes API fields", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = new URL(String(input));
      const page = Number(url.searchParams.get("page"));
      const rows = page === 1 ? Array.from({ length: 100 }, (_, index) => repo(index + 1)) : [repo(101)];
      return new Response(JSON.stringify(rows), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const repositories = await new GitHubService().getRepositories("sample");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(repositories).toHaveLength(101);
    expect(repositories[0]).toMatchObject({ id: 1, fullName: "sample/project-1", owner: "sample", defaultBranch: "main" });
  });
});
