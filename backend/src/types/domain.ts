export type DataSource = "live" | "cache" | "mock";

export type GitHubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
};

export type GitHubRepository = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  updatedAt: string;
  owner: string;
  defaultBranch: string;
};

export type LeetCodeProfile = {
  username: string;
  ranking: number | null;
  realName: string | null;
  about: string | null;
};

export type LeetCodeStatsData = {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number | null;
  currentStreak: number;
  longestStreak: number;
  totalSubmissions: number;
  submissionCalendar: Record<string, number>;
  fetchedAt: string;
};

