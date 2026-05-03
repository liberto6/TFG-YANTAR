import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHook } from "../../../../test/test-utils";
import { useCompanyConfig } from "../use-company-config";

// Mock api client
vi.mock("@/lib/api-client", () => ({
  api: {
    get: vi.fn(),
  },
}));

const { api } = await import("@/lib/api-client");

const MOCK_CONFIG = {
  id: "company-uuid-001",
  name: "Pizzería Nápoli",
  slug: "napoli",
  appName: "Pide en Nápoli",
  logoUrl: null,
  welcomeMessage: "Bienvenido",
  colorPrimary: "#e63946",
  colorSecondary: null,
  colorAccent: null,
  colorBackground: null,
  colorSurface: null,
  colorText: null,
  colorTextMuted: null,
};

describe("useCompanyConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns company config with id resolved from slug", async () => {
    vi.mocked(api.get).mockResolvedValue(MOCK_CONFIG);

    const { result } = renderHook(() => useCompanyConfig());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe("company-uuid-001");
    expect(result.current.data?.slug).toBe("napoli");
  });

  it("calls the correct endpoint using the tenant slug from context", async () => {
    vi.mocked(api.get).mockResolvedValue(MOCK_CONFIG);

    const { result } = renderHook(() => useCompanyConfig());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("/companies/"),
    );
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("/config"),
    );
  });

  it("exposes appName and branding fields", async () => {
    vi.mocked(api.get).mockResolvedValue(MOCK_CONFIG);

    const { result } = renderHook(() => useCompanyConfig());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.appName).toBe("Pide en Nápoli");
    expect(result.current.data?.colorPrimary).toBe("#e63946");
  });

  it("starts in loading state", () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useCompanyConfig());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("surfaces error when fetch fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCompanyConfig());

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});
