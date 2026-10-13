export type LeetCodeStats = {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  currentStreak: number;
  longestStreak: number;
  ranking: string;
  submissions: number;
  activity: { date: string; count: number }[];
};

export const LEETCODE_USERNAME = "S2q0Dy2m8u";
export const LEETCODE_PROFILE_URL = `https://leetcode.com/u/${LEETCODE_USERNAME}/`;

export async function loadLeetCodeStats(): Promise<LeetCodeStats> {
  const response = await fetch("/api/leetcode/stats", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load LeetCode profile stats");
  return response.json() as Promise<LeetCodeStats>;
}
