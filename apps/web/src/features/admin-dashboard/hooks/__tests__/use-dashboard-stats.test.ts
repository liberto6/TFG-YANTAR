import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHook } from "@/test/test-utils";
import { useDashboardStats } from "../use-dashboard-stats";

vi.mock("@/lib/api-client", () => ({
  api: { get: vi.fn() },
}));

const { api } = await import("@/lib/api-client");

const MOCK_STATS = {
  ordersTotal: 10,
  revenue: 150.5,
  avgTicket: 25.08,
  deliveredCount: 6,
  activeCount: 3,
  cancelledCount: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useDashboardStats", () => {
  it("does not fetch when branchId is null", () => {
    renderHook(() => useDashboardStats(null));
    expect(vi.mocked(api.get)).not.toHaveBeenCalled();
  });

  it("fetches stats for the given branchId", async () => {
    vi.mocked(api.get).mockResolvedValue(MOCK_STATS);
    const { result } = renderHook(() => useDashboardStats("branch-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(api.get)).toHaveBeenCalledWith(
      expect.stringContaining("branchId=branch-1"),
    );
    expect(result.current.data).toEqual(MOCK_STATS);
  });

  it("includes date param when date is provided", async () => {
    vi.mocked(api.get).mockResolvedValue(MOCK_STATS);
    const date = new Date("2025-06-15T12:00:00Z");
    renderHook(() => useDashboardStats("branch-1", date));

    await waitFor(() => expect(vi.mocked(api.get)).toHaveBeenCalled());
    expect(vi.mocked(api.get)).toHaveBeenCalledWith(
      expect.stringContaining("date=2025-06-15"),
    );
  });

  it("does not include date param when date is undefined", async () => {
    vi.mocked(api.get).mockResolvedValue(MOCK_STATS);
    renderHook(() => useDashboardStats("branch-1"));

    await waitFor(() => expect(vi.mocked(api.get)).toHaveBeenCalled());
    expect(vi.mocked(api.get)).not.toHaveBeenCalledWith(
      expect.stringContaining("date="),
    );
  });

  it("returns loading state initially", async () => {
    vi.mocked(api.get).mockResolvedValue(MOCK_STATS);
    const { result } = renderHook(() => useDashboardStats("branch-1"));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("returns error state when request fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useDashboardStats("branch-1"));

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
