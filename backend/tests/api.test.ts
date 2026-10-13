import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("API middleware and public contract", () => {
  it("rejects invalid project slugs at the request boundary", async () => {
    const response = await request(app).get("/api/v1/projects/not%20a%20slug");
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, error: { code: "VALIDATION_ERROR" } });
  });

  it("keeps administrative sync status private", async () => {
    const response = await request(app).get("/api/v1/admin/sync/status");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects browser origins outside the configured allow-list", async () => {
    const response = await request(app).get("/").set("Origin", "https://invalid.example");
    expect(response.status).toBe(403);
  });
});
