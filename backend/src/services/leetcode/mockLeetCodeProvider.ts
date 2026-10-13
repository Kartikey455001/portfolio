import { mockLeetCodeStats } from "../mock-data.js";
import type { LeetCodeProfile, LeetCodeStatsData } from "../../types/domain.js";
import type { LeetCodeProvider } from "./leetcodeProvider.js";

export class MockLeetCodeProvider implements LeetCodeProvider {
  async getProfile(username: string): Promise<LeetCodeProfile> { return { username, ranking: null, realName: null, about: null }; }
  async getStats(username: string): Promise<Omit<LeetCodeStatsData, "fetchedAt">> {
    const { fetchedAt: _fetchedAt, ...stats } = mockLeetCodeStats;
    return { ...stats, username };
  }
  async getSubmissionCalendar(username: string) {
    return (await this.getStats(username)).submissionCalendar;
  }
}
