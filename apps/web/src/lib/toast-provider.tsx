"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Toast, type ToastItem, type ToastVariant } from "@/components/ui/toast";

interface ToastOptions {
  description?: string;
  duration?: number;
}

interface ToastApi {
  show: (variant: ToastVariant, message: string, opts?: ToastOptions) => void;
  success: (message: string, opts?: ToastOptions) => void;
  error: (message: string, opts?: ToastOptions) => void;
  info: (message: string, opts?: ToastOptions) => void;
  warning: (message: string, opts?: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let counter = 0;
const nextId = () => `toast-${Date.now()}-${++counter}`;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, message: string, opts?: ToastOptions) => {
      const item: ToastItem = {
        id: nextId(),
        variant,
        message,
        description: opts?.description,
        duration: opts?.duration,
      };
      setToasts((prev) => [...prev, item].slice(-5)); // cap at 5
    },
    [],
  );

  const api: ToastApi = {
    show,
    success: (message, opts) => show("success", message, opts),
    error: (message, opts) => show("error", message, opts),
    info: (message, opts) => show("info", message, opts),
    warning: (message, opts) => show("warning", message, opts),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-4 sm:right-4 sm:left-auto sm:items-end sm:px-0"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
