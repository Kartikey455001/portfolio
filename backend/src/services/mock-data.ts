import type { GitHubRepository, GitHubUser, LeetCodeStatsData } from "../types/domain.js";

export const mockGithubUser: GitHubUser = {
  login: "kartikeyupadhyay", name: "Kartikey Upadhyay", bio: "Full Stack Developer | AI Enthusiast | Problem Solver",
  avatarUrl: "https://avatars.githubusercontent.com/u/0?v=4", htmlUrl: "https://github.com/kartikeyupadhyay", publicRepos: 5, followers: 0, following: 0,
};

export const mockGithubRepositories: GitHubRepository[] = [
  { id: 10001, name: "smart-campus-parking", fullName: "kartikeyupadhyay/smart-campus-parking", description: "A full stack application for parking management, real-time availability and analytics.", htmlUrl: "https://github.com/kartikeyupadhyay", homepage: null, language: "TypeScript", topics: ["react", "nodejs", "parking"], stars: 18, forks: 4, updatedAt: "2026-01-01T00:00:00.000Z", owner: "kartikeyupadhyay", defaultBranch: "main" },
  { id: 10002, name: "streaming-ui", fullName: "kartikeyupadhyay/streaming-ui", description: "A responsive streaming interface built with React.", htmlUrl: "https://github.com/kartikeyupadhyay", homepage: null, language: "TypeScript", topics: ["react", "frontend"], stars: 7, forks: 1, updatedAt: "2025-12-01T00:00:00.000Z", owner: "kartikeyupadhyay", defaultBranch: "main" },
  { id: 10003, name: "lets-connect", fullName: "kartikeyupadhyay/lets-connect", description: "A full stack place to share ideas and connect.", htmlUrl: "https://github.com/kartikeyupadhyay", homepage: null, language: "JavaScript", topics: ["full-stack"], stars: 4, forks: 0, updatedAt: "2025-11-01T00:00:00.000Z", owner: "kartikeyupadhyay", defaultBranch: "main" },
];

export const mockLeetCodeStats: LeetCodeStatsData = {
  username: "demo-user", totalSolved: 106, easySolved: 42, mediumSolved: 46, hardSolved: 18, ranking: null,
  currentStreak: 12, longestStreak: 35, totalSubmissions: 400,
  submissionCalendar: Object.fromEntries(Array.from({ length: 238 }, (_, index) => [String(1735689600 + index * 86400), (index * 7 + 3) % 5])),
  fetchedAt: new Date(0).toISOString(),
};
