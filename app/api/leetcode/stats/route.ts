import { NextResponse } from "next/server";
import { LEETCODE_USERNAME } from "@/lib/services/leetcode-service";

const endpoint = "https://leetcode.com/graphql/";
const query = `query portfolioPublicProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile { ranking }
    submitStats { acSubmissionNum { difficulty count } totalSubmissionNum { difficulty count } }
    userCalendar { submissionCalendar }
  }
}`;

export async function GET() {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json", "user-agent": "portfolio-site" },
      body: JSON.stringify({ query, variables: { username: LEETCODE_USERNAME } }),
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "LeetCode request failed" }, { status: 502 });

    const payload = await response.json();
    const user = payload?.data?.matchedUser;
    if (!user) return NextResponse.json({ error: "LeetCode profile was not found" }, { status: 404 });

    const accepted = user.submitStats?.acSubmissionNum ?? [];
    const submissions = user.submitStats?.totalSubmissionNum ?? [];
    const count = (items: Array<{ difficulty: string; count: number }>, difficulty: string) =>
      items.find((item) => item.difficulty.toLowerCase() === difficulty.toLowerCase())?.count ?? 0;
    let calendar: Record<string, number> = {};
    try {
      const parsed = JSON.parse(user.userCalendar?.submissionCalendar ?? "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) calendar = parsed;
    } catch {
      calendar = {};
    }

    const today = new Date();
    const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const dayMs = 86_400_000;
    const active = new Set(Object.entries(calendar)
      .filter(([, value]) => typeof value === "number" && value > 0)
      .map(([timestamp]) => new Date(Number(timestamp) * 1000).toISOString().slice(0, 10)));
    let currentStreak = 0;
    let cursor = active.has(new Date(utcToday).toISOString().slice(0, 10))
      ? utcToday
      : active.has(new Date(utcToday - dayMs).toISOString().slice(0, 10)) ? utcToday - dayMs : 0;
    while (cursor && active.has(new Date(cursor).toISOString().slice(0, 10))) {
      currentStreak += 1;
      cursor -= dayMs;
    }
    let longestStreak = 0;
    let run = 0;
    const dates = [...active].sort();
    for (let index = 0; index < dates.length; index += 1) {
      run = index > 0 && Date.parse(`${dates[index]}T00:00:00Z`) - Date.parse(`${dates[index - 1]}T00:00:00Z`) === dayMs ? run + 1 : 1;
      longestStreak = Math.max(longestStreak, run);
    }

    const countsByDate = new Map(Object.entries(calendar).map(([timestamp, value]) => [
      new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
      typeof value === "number" && Number.isFinite(value) ? value : 0,
    ]));
    const currentDate = new Date(utcToday);
    const mondayOffset = (currentDate.getUTCDay() + 6) % 7;
    const firstDay = utcToday - (33 * 7 + mondayOffset) * dayMs;
    const activity = Array.from({ length: 34 * 7 }, (_, index) => {
      const date = new Date(firstDay + index * dayMs).toISOString().slice(0, 10);
      return { date, count: countsByDate.get(date) ?? 0 };
    });

    return NextResponse.json({
      total: count(accepted, "All"), easy: count(accepted, "Easy"), medium: count(accepted, "Medium"), hard: count(accepted, "Hard"),
      currentStreak, longestStreak, activeDays: active.size, ranking: user.profile?.ranking ? `#${Number(user.profile.ranking).toLocaleString()} Global` : "Unranked",
      submissions: count(submissions, "All"), activity,
    }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ error: "Unable to reach LeetCode right now" }, { status: 502 });
  }
}
