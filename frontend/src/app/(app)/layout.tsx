import type { Metadata } from "next";
import { AppShell } from "@/features/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Controle de enxoval",
    template: "%s · Enxoval"
  }
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
