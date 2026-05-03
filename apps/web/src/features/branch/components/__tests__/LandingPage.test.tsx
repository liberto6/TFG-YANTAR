import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import { LandingPage } from "@/features/branch/components/LandingPage";

// vi.hoisted creates variables accessible inside vi.mock factory (which is hoisted before imports)
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({}),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/branch/hooks/use-branches", () => ({
  useBranches: vi.fn(),
}));

vi.mock("@/features/branch/hooks/use-check-delivery", () => ({
  useCheckDelivery: vi.fn(),
}));

vi.mock("@/features/branch/context/branch-context", () => ({
  useBranch: vi.fn(),
}));

const { useBranches } = await import("@/features/branch/hooks/use-branches");
const { useCheckDelivery } = await import("@/features/branch/hooks/use-check-delivery");
const { useBranch } = await import("@/features/branch/context/branch-context");

const BRANCH = {
  id: "branch-001",
  name: "Sede Central",
  address: "Calle Mayor, 1",
  serviceModes: ["PICKUP", "DELIVERY"],
};

const DEFAULT_PROPS = {
  franchiseName: "Pizzería Test",
  logoUrl: null,
  welcomeMessage: null,
};

describe("LandingPage", () => {
  const mockSelectBranch = vi.fn();
  const mockCheckDelivery = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useBranches).mockReturnValue({
      data: [BRANCH],
      isLoading: false,
    } as any);

    vi.mocked(useCheckDelivery).mockReturnValue({
      checkDelivery: mockCheckDelivery,
      isChecking: false,
      error: null,
      clearError: mockClearError,
    } as any);

    vi.mocked(useBranch).mockReturnValue({
      selectBranch: mockSelectBranch,
      branch: null,
    } as any);
  });

  it("renders the franchise name in the header", () => {
    render(<LandingPage {...DEFAULT_PROPS} />);
    expect(screen.getByRole("heading", { name: "Pizzería Test" })).toBeInTheDocument();
  });

  it("shows branch list on first step", () => {
    render(<LandingPage {...DEFAULT_PROPS} />);
    expect(screen.getByText("Sede Central")).toBeInTheDocument();
    expect(screen.getByText("Calle Mayor, 1")).toBeInTheDocument();
  });

  it("shows loading skeletons while branches load", () => {
    vi.mocked(useBranches).mockReturnValue({ data: undefined, isLoading: true } as any);

    const { container } = render(<LandingPage {...DEFAULT_PROPS} />);

    expect(container.querySelectorAll(".shimmer")).toHaveLength(2);
  });

  it("moves to mode step when a branch is clicked", async () => {
    render(<LandingPage {...DEFAULT_PROPS} />);

    await userEvent.click(screen.getByText("Sede Central"));

    expect(screen.getByText(/Cómo quieres recibirlo/)).toBeInTheDocument();
  });

  it("calls selectBranch and navigates to /menu on pickup", async () => {
    render(<LandingPage {...DEFAULT_PROPS} />);

    await userEvent.click(screen.getByText("Sede Central"));
    await userEvent.click(screen.getByText(/Recoger en el local/));

    expect(mockSelectBranch).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryMode: "PICKUP", deliveryFee: 0 }),
    );
    expect(mockPush).toHaveBeenCalledWith("/menu");
  });

  it("advances to address step when delivery is chosen", async () => {
    render(<LandingPage {...DEFAULT_PROPS} />);

    await userEvent.click(screen.getByText("Sede Central"));
    await userEvent.click(screen.getByText(/Envío a domicilio/));

    expect(screen.getByPlaceholderText(/Calle, número, ciudad/)).toBeInTheDocument();
  });

  it("disables confirm button when address is empty", async () => {
    render(<LandingPage {...DEFAULT_PROPS} />);

    await userEvent.click(screen.getByText("Sede Central"));
    await userEvent.click(screen.getByText(/Envío a domicilio/));

    expect(screen.getByRole("button", { name: /Confirmar dirección/ })).toBeDisabled();
    expect(mockCheckDelivery).not.toHaveBeenCalled();
  });

  it("calls checkDelivery and navigates to /menu on successful address confirm", async () => {
    mockCheckDelivery.mockResolvedValue({
      zoneId: "zone-001",
      zoneName: "Zona Norte",
      deliveryFee: 2.5,
      estimatedTimeMinutes: 30,
      minOrderAmount: 10,
    });

    render(<LandingPage {...DEFAULT_PROPS} />);

    await userEvent.click(screen.getByText("Sede Central"));
    await userEvent.click(screen.getByText(/Envío a domicilio/));
    await userEvent.type(screen.getByPlaceholderText(/Calle, número, ciudad/), "Calle Mayor, 5");
    await userEvent.click(screen.getByRole("button", { name: /Confirmar dirección/ }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/menu"));
    expect(mockSelectBranch).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryMode: "DELIVERY", deliveryFee: 2.5 }),
    );
  });

  it("shows out-of-zone error when checkDelivery returns null", async () => {
    mockCheckDelivery.mockResolvedValue(null);

    render(<LandingPage {...DEFAULT_PROPS} />);

    await userEvent.click(screen.getByText("Sede Central"));
    await userEvent.click(screen.getByText(/Envío a domicilio/));
    await userEvent.type(screen.getByPlaceholderText(/Calle, número, ciudad/), "Calle Lejana, 99");
    await userEvent.click(screen.getByRole("button", { name: /Confirmar dirección/ }));

    await waitFor(() =>
      expect(screen.getByText(/fuera de nuestra zona de reparto/)).toBeInTheDocument(),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("going back from mode step returns to branch list", async () => {
    render(<LandingPage {...DEFAULT_PROPS} />);

    await userEvent.click(screen.getByText("Sede Central"));
    expect(screen.getByText(/Cambiar local/)).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Cambiar local/));
    expect(screen.getByText(/¿Desde qué local/)).toBeInTheDocument();
  });
});
