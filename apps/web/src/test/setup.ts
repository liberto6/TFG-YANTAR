import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js navigation — not available in jsdom
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({}),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image — avoids SSR/loader issues in tests
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => {
    const React = require("react");
    return React.createElement("img", { src, alt });
  },
}));

// Provide a stable localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });
