import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import { BranchSelectorBar } from "@/features/operativo/components/BranchSelectorBar";

// Mock the hook so tests are isolated from localStorage / API
vi.mock("@/features/operativo/hooks/use-selected-branch", () => ({
  useSelectedBranch: vi.fn(),
}));

const { useSelectedBranch } = await import(
  "@/features/operativo/hooks/use-selected-branch"
);

const BRANCH_A = {
  id: "branch-001",
  companyId: "c1",
  name: "Sede Central",
  address: "",
  phone: null,
  email: null,
  latitude: null,
  longitude: null,
  serviceModes: [],
  isActive: true,
  createdAt: "",
  updatedAt: "",
};

const BRANCH_B = { ...BRANCH_A, id: "branch-002", name: "Sede Norte" };

describe("BranchSelectorBar", () => {
  it("renders a loading skeleton while loading", () => {
    vi.mocked(useSelectedBranch).mockReturnValue({
      isLoading: true,
      branches: [],
      selectedBranchId: null,
      selectedBranch: null,
      setSelectedBranchId: vi.fn(),
    });

    const { container } = render(<BranchSelectorBar />);

    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("shows branch name as text for a single branch", () => {
    vi.mocked(useSelectedBranch).mockReturnValue({
      isLoading: false,
      branches: [BRANCH_A],
      selectedBranchId: "branch-001",
      selectedBranch: BRANCH_A,
      setSelectedBranchId: vi.fn(),
    });

    render(<BranchSelectorBar />);

    expect(screen.getByText("Sede Central")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("renders nothing when single-branch setup but no branch selected yet", () => {
    vi.mocked(useSelectedBranch).mockReturnValue({
      isLoading: false,
      branches: [BRANCH_A],
      selectedBranchId: null,
      selectedBranch: null,
      setSelectedBranchId: vi.fn(),
    });

    const { container } = render(<BranchSelectorBar />);

    expect(container.firstChild).toBeNull();
  });

  it("renders a select dropdown with all branches when multiple exist", () => {
    vi.mocked(useSelectedBranch).mockReturnValue({
      isLoading: false,
      branches: [BRANCH_A, BRANCH_B],
      selectedBranchId: "branch-001",
      selectedBranch: BRANCH_A,
      setSelectedBranchId: vi.fn(),
    });

    render(<BranchSelectorBar />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Sede Central")).toBeInTheDocument();
    expect(screen.getByText("Sede Norte")).toBeInTheDocument();
  });

  it("calls setSelectedBranchId when a new option is selected", async () => {
    const setSelectedBranchId = vi.fn();

    vi.mocked(useSelectedBranch).mockReturnValue({
      isLoading: false,
      branches: [BRANCH_A, BRANCH_B],
      selectedBranchId: "branch-001",
      selectedBranch: BRANCH_A,
      setSelectedBranchId,
    });

    render(<BranchSelectorBar />);

    await userEvent.selectOptions(screen.getByRole("combobox"), "branch-002");

    expect(setSelectedBranchId).toHaveBeenCalledWith("branch-002");
  });
});
