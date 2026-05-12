export type ToastVariant = "success" | "error" | "info";

const EVENT = "baby-toast";

export type ToastDetail = { message: string; variant: ToastVariant };

/** Dispara um toast global (ouvido pelo ToastHost). */
export function emitToast(message: string, variant: ToastVariant = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastDetail>(EVENT, { detail: { message, variant } }));
}

export const toastEventName = EVENT;
