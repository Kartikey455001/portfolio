import { z } from "zod";
import { AppError } from "../../utils/app-error.js";
import type { LeetCodeProfile, LeetCodeStatsData } from "../../types/domain.js";
import type { LeetCodeProvider, SubmissionCalendar } from "./leetcodeProvider.js";

const endpoint = "https://leetcode.com/graphql/";
const query = `query portfolioPublicProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile { ranking realName aboutMe }
    submitStats { acSubmissionNum { difficulty count } totalSubmissionNum { difficulty count } }
    userCalendar { submissionCalendar }
  }
}`;

const responseSchema = z.object({
  data: z.object({ matchedUser: z.object({
    username: z.string(),
    profile: z.object({ ranking: z.number().nullable().optional(), realName: z.string().nullable().optional(), aboutMe: z.string().nullable().optional() }).nullable(),
    submitStats: z.object({ acSubmissionNum: z.array(z.object({ difficulty: z.string(), count: z.number() })), totalSubmissionNum: z.array(z.object({ difficulty: z.string(), count: z.number() })) }).nullable(),
    userCalendar: z.object({ submissionCalendar: z.string().optional().nullable() }).nullable(),
  }).nullable() }),
});

type UserPayload = z.infer<typeof responseSchema>["data"]["matchedUser"];

function calendarFrom(value: string | null | undefined): SubmissionCalendar {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, count]) => typeof count === "number" && Number.isFinite(count) && count >= 0)) as SubmissionCalendar;
  } catch { return {}; }
}

function streaks(calendar: SubmissionCalendar) {
  const activeDays = new Set(Object.entries(calendar).filter(([, count]) => count > 0).map(([timestamp]) => new Date(Number(timestamp) * 1000).toISOString().slice(0, 10)));
  if (!activeDays.size) return { currentStreak: 0, longestStreak: 0 };
  const dates = [...activeDays].sort();
  let longestStreak = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    const previous = Date.parse(`${dates[index - 1]}T00:00:00Z`);
    const current = Date.parse(`${dates[index]}T00:00:00Z`);
    run = current - previous === 86_400_000 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }
  const today = new Date();
  const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0, 10);
  const utcYesterday = new Date(Date.parse(`${utcToday}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  let currentStreak = 0;
  let cursor = activeDays.has(utcToday) ? utcToday : activeDays.has(utcYesterday) ? utcYesterday : "";
  while (cursor && activeDays.has(cursor)) {
    currentStreak += 1;
    cursor = new Date(Date.parse(`${cursor}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  }
  return { currentStreak, longestStreak };
}

export class LeetCodeGraphQLProvider implements LeetCodeProvider {
  private inFlight = new Map<string, Promise<NonNullable<UserPayload>>>();

  private async user(username: string): Promise<NonNullable<UserPayload>> {
    const existing = this.inFlight.get(username);
    if (existing) return existing;
    const request = this.fetchUser(username).finally(() => this.inFlight.delete(username));
    this.inFlight.set(username, request);
    return request;
  }

  private async fetchUser(username: string): Promise<NonNullable<UserPayload>> {
    const response = await fetch(endpoint, {
      method: "POST", headers: { "content-type": "application/json", accept: "application/json", "user-agent": "portfolio-api" },
      body: JSON.stringify({ query, variables: { username } }), signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new AppError(502, "LEETCODE_PROVIDER_ERROR", `LeetCode request failed (${response.status})`);
    const json: unknown = await response.json();
    const parsed = responseSchema.safeParse(json);
    if (!parsed.success) throw new AppError(502, "LEETCODE_INVALID_RESPONSE", "LeetCode returned an unexpected response");
    if (!parsed.data.data.matchedUser) throw new AppError(404, "LEETCODE_USER_NOT_FOUND", "LeetCode user was not found");
    return parsed.data.data.matchedUser;
  }

  async getProfile(username: string): Promise<LeetCodeProfile> {
    const user = await this.user(username);
    return { username: user.username, ranking: user.profile?.ranking ?? null, realName: user.profile?.realName ?? null, about: user.profile?.aboutMe ?? null };
  }

  async getSubmissionCalendar(username: string): Promise<SubmissionCalendar> {
    const user = await this.user(username);
    return calendarFrom(user.userCalendar?.submissionCalendar);
  }

  async getStats(username: string): Promise<Omit<LeetCodeStatsData, "fetchedAt">> {
    const user = await this.user(username);
    const accepted = user.submitStats?.acSubmissionNum ?? [];
    const totals = user.submitStats?.totalSubmissionNum ?? [];
    const count = (entries: typeof accepted, difficulty: string) => entries.find((entry) => entry.difficulty.toLowerCase() === difficulty.toLowerCase())?.count ?? 0;
    const submissionCalendar = calendarFrom(user.userCalendar?.submissionCalendar);
    const { currentStreak, longestStreak } = streaks(submissionCalendar);
    return {
      username: user.username, totalSolved: count(accepted, "All"), easySolved: count(accepted, "Easy"), mediumSolved: count(accepted, "Medium"), hardSolved: count(accepted, "Hard"),
      ranking: user.profile?.ranking ?? null, currentStreak, longestStreak, totalSubmissions: count(totals, "All"), submissionCalendar,
    };
  }
}
