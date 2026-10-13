import { afterEach, describe, expect, it, vi } from "vitest";
import { LeetCodeGraphQLProvider } from "../src/services/leetcode/leetcodeGraphQLProvider.js";

afterEach(() => vi.unstubAllGlobals());

describe("LeetCode GraphQL adapter", () => {
  it("normalizes public stats and coalesces concurrent profile/calendar requests", async () => {
    const today = new Date();
    const midnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) / 1000;
    const calendar = { [String(midnight - 86400)]: 2, [String(midnight - 2 * 86400)]: 1 };
    const payload = { data: { matchedUser: {
      username: "sample-user", profile: { ranking: 400, realName: "Sample", aboutMe: "" },
      submitStats: { acSubmissionNum: [{ difficulty: "All", count: 17 }, { difficulty: "Easy", count: 8 }, { difficulty: "Medium", count: 7 }, { difficulty: "Hard", count: 2 }], totalSubmissionNum: [{ difficulty: "All", count: 41 }] },
      userCalendar: { submissionCalendar: JSON.stringify(calendar) },
    } } };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const provider = new LeetCodeGraphQLProvider();
    const [stats, profile, activity] = await Promise.all([provider.getStats("sample-user"), provider.getProfile("sample-user"), provider.getSubmissionCalendar("sample-user")]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(stats).toMatchObject({ totalSolved: 17, easySolved: 8, mediumSolved: 7, hardSolved: 2, totalSubmissions: 41 });
    expect(profile.ranking).toBe(400);
    expect(Object.keys(activity)).toHaveLength(2);
  });
});
