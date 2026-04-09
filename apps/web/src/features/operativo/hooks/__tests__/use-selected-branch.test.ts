import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { renderHook } from "@/test/test-utils";
import { useSelectedBranch } from "../use-selected-branch";

// Mock the admin branches hook
vi.mock("@/features/admin-company/hooks/use-admin-branches", () => ({
  useAdminBranches: vi.fn(),
}));

const { useAdminBranches } = await import(
  "@/features/admin-company/hooks/use-admin-branches"
);

const BRANCH_A = {
  id: "branch-001",
  companyId: "company-001",
  name: "Sede Central",
  address: "Calle Mayor, 1",
  phone: null,
  email: null,
  latitude: 37.38,
  longitude: -5.98,
  serviceModes: ["DELIVERY" as const, "PICKUP" as const],
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const BRANCH_B = {
  ...BRANCH_A,
  id: "branch-002",
  name: "Sede Norte",
  address: "Avenida del Norte, 10",
};

const STORAGE_KEY = "yantar_admin_selected_branch";

describe("useSelectedBranch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("returns isLoading=true while branches are loading", () => {
    vi.mocked(useAdminBranches).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() => useSelectedBranch());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.branches).toEqual([]);
    expect(result.current.selectedBranch).toBeNull();
  });

  it("auto-selects the first branch when only one exists", async () => {
    vi.mocked(useAdminBranches).mockReturnValue({
      data: [BRANCH_A],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useSelectedBranch());

    await waitFor(() => expect(result.current.selectedBranchId).toBe("branch-001"));
    expect(result.current.selectedBranch?.name).toBe("Sede Central");
  });

  it("auto-selects the first branch when multiple exist and nothing stored", async () => {
    vi.mocked(useAdminBranches).mockReturnValue({
      data: [BRANCH_A, BRANCH_B],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useSelectedBranch());

    await waitFor(() => expect(result.current.selectedBranchId).toBe("branch-001"));
    expect(result.current.branches).toHaveLength(2);
  });

  it("restores the stored branch from localStorage", async () => {
    localStorage.setItem(STORAGE_KEY, "branch-002");

    vi.mocked(useAdminBranches).mockReturnValue({
      data: [BRANCH_A, BRANCH_B],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useSelectedBranch());

    await waitFor(() => expect(result.current.selectedBranchId).toBe("branch-002"));
    expect(result.current.selectedBranch?.name).toBe("Sede Norte");
  });

  it("falls back to first branch when stored id is no longer valid", async () => {
    localStorage.setItem(STORAGE_KEY, "branch-deleted");

    vi.mocked(useAdminBranches).mockReturnValue({
      data: [BRANCH_A, BRANCH_B],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useSelectedBranch());

    await waitFor(() => expect(result.current.selectedBranchId).toBe("branch-001"));
  });

  it("persists the selection to localStorage when setSelectedBranchId is called", async () => {
    vi.mocked(useAdminBranches).mockReturnValue({
      data: [BRANCH_A, BRANCH_B],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useSelectedBranch());

    await waitFor(() => expect(result.current.selectedBranchId).not.toBeNull());

    act(() => {
      result.current.setSelectedBranchId("branch-002");
    });

    expect(result.current.selectedBranchId).toBe("branch-002");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("branch-002");
  });
});
