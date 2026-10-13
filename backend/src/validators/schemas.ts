import { z } from "zod";

export const slugParam = z.object({ slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
export const queryUsername = z.object({ username: z.string().trim().min(1).max(39).regex(/^[a-zA-Z0-9-]+$/).optional() });

export const githubUserSchema = z.object({
  login: z.string().min(1), name: z.string().nullable(), bio: z.string().nullable(), avatar_url: z.string().url(), html_url: z.string().url(),
  public_repos: z.number().int().nonnegative(), followers: z.number().int().nonnegative(), following: z.number().int().nonnegative(),
});

export const githubRepositorySchema = z.object({
  id: z.number().int().positive(), name: z.string().min(1), full_name: z.string().min(1), description: z.string().nullable(),
  html_url: z.string().url(), homepage: z.string().nullable(), language: z.string().nullable(), topics: z.array(z.string()).default([]),
  stargazers_count: z.number().int().nonnegative(), forks_count: z.number().int().nonnegative(), updated_at: z.string().datetime(),
  owner: z.object({ login: z.string().min(1) }), default_branch: z.string().min(1),
}).passthrough();

export const leetCodeStatsSchema = z.object({
  username: z.string().min(1), totalSolved: z.number().int().nonnegative(), easySolved: z.number().int().nonnegative(),
  mediumSolved: z.number().int().nonnegative(), hardSolved: z.number().int().nonnegative(), ranking: z.number().int().nonnegative().nullable(),
  currentStreak: z.number().int().nonnegative(), longestStreak: z.number().int().nonnegative(), totalSubmissions: z.number().int().nonnegative(),
  submissionCalendar: z.record(z.string(), z.number().nonnegative()), fetchedAt: z.string().datetime(),
});

