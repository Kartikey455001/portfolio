import { describe, expect, it, vi } from "vitest";
import { SyncService } from "../src/services/sync/syncService.js";

describe("SyncService", () => {
  it("runs independent providers concurrently and reports individual failures", async () => {
    const service = new SyncService();
    vi.spyOn(service, "syncGitHub").mockResolvedValue({ provider: "github", status: "success", itemsFetched: 2, dataSource: "live", fetchedAt: "2026-01-01T00:00:00.000Z" });
    vi.spyOn(service, "syncLeetCode").mockRejectedValue(new Error("provider down"));
    const result = await service.syncAll();
    expect(result.map((item) => item.provider)).toEqual(["github", "leetcode"]);
    expect(result[1]).toMatchObject({ provider: "leetcode", status: "error", error: "provider down" });
  });
});
