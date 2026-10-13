import type { LeetCodeProfile, LeetCodeStatsData } from "../../types/domain.js";

export type SubmissionCalendar = Record<string, number>;

export interface LeetCodeProvider {
  getProfile(username: string): Promise<LeetCodeProfile>;
  getStats(username: string): Promise<Omit<LeetCodeStatsData, "fetchedAt">>;
  getSubmissionCalendar(username: string): Promise<SubmissionCalendar>;
}
