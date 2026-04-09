import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = React.useMemo(makeQueryClient, []);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function customRender(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Wrapper, ...options });
}

function customRenderHook<T>(hook: () => T) {
  return renderHook(hook, { wrapper: Wrapper });
}

export { customRender as render, customRenderHook as renderHook };
export * from "@testing-library/react";
