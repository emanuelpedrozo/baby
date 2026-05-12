import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export function IconButton({
  label,
  icon: Icon,
  onClick,
  disabled
}: {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="grid h-10 w-10 place-items-center rounded-md border border-black/10 bg-white/80 text-ink shadow-sm transition hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-sage-500 disabled:pointer-events-none disabled:opacity-45 dark:border-white/10 dark:bg-white/10 dark:text-white"
      type="button"
    >
      <Icon size={18} aria-hidden />
    </button>
  );
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  disabled,
  onClick,
  className = ""
}: {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-sage-700 text-white hover:bg-sage-500"
      : "border border-black/10 bg-white text-ink hover:bg-sage-50 dark:border-white/10 dark:bg-white/10 dark:text-white";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sage-500 disabled:pointer-events-none disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Metric({
  label,
  value,
  icon: Icon,
  tone = "sage"
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "sage" | "clay" | "blue" | "amber";
}) {
  const color = {
    sage: "bg-sage-100 text-sage-700",
    clay: "bg-clay-100 text-clay-600",
    blue: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700"
  }[tone];

  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-black/60 dark:text-white/65">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-md ${color}`}>
          <Icon size={18} aria-hidden />
        </span>
      </div>
      <strong className="mt-3 block text-2xl font-semibold tracking-normal">{value}</strong>
    </section>
  );
}

export function ProgressBar({ value, color = "#718766" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10" aria-hidden>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}
