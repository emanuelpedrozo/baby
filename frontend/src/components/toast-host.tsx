"use client";

import { useEffect, useState } from "react";
import type { ToastDetail } from "@/lib/toast";
import { toastEventName } from "@/lib/toast";

type Toast = ToastDetail & { id: string };

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const e = event as CustomEvent<ToastDetail>;
      if (!e.detail?.message) return;
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, ...e.detail }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    };
    window.addEventListener(toastEventName, handler as EventListener);
    return () => window.removeEventListener(toastEventName, handler as EventListener);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-[100] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto max-w-md rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
            t.variant === "error"
              ? "border-clay-200 bg-clay-50 text-clay-900 dark:border-clay-800 dark:bg-clay-950/90 dark:text-clay-100"
              : t.variant === "info"
                ? "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/90 dark:text-sky-100"
                : "border-sage-200 bg-sage-50 text-sage-950 dark:border-sage-800 dark:bg-sage-950/90 dark:text-sage-100"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
