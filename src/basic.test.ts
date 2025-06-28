import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "./lib/apiClient";

describe("ApiClient", () => {
  let client: ApiClient;
  beforeEach(() => {
    client = new ApiClient();
    // @ts-expect-error: global.fetch is not typed for mocking in Vitest
    global.fetch = vi.fn();
    localStorage.clear();
  });

  it("sets and clears token in localStorage", () => {
    client.setToken("abc123");
    expect(localStorage.getItem("auth_token")).toBe("abc123");
    client.clearToken();
    expect(localStorage.getItem("auth_token")).toBeNull();
  });

  it("throws on 401 and clears token", async () => {
    // @ts-expect-error: global.fetch is not typed for mocking in Vitest
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Unauthorized" }),
      statusText: "Unauthorized",
    });
    client.setToken("abc123");
    await expect(client.request("/workspaces")).rejects.toThrow(
      "Authentication required"
    );
    expect(localStorage.getItem("auth_token")).toBeNull();
  });
});
