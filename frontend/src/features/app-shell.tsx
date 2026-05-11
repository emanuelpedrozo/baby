"use client";

import {
  Baby,
  Bell,
  ClipboardCheck,
  Download,
  Gift,
  ListChecks,
  Moon,
  PackageCheck,
  Share2,
  Sun,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { date } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { IconButton } from "@/components/ui";
import { LoginPanel } from "./login-panel";
import { ProjectControls } from "./project-controls";
import { demoDashboard, demoProject } from "./demo-data";
import { useProjectId } from "./use-project-id";
import type { Dashboard } from "./types";

const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Dashboard", icon: PackageCheck },
  { href: "/itens", label: "Itens", icon: ListChecks },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/checklist", label: "Checklist", icon: ClipboardCheck },
  { href: "/presentes", label: "Presentes", icon: Gift }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, darkMode, toggleDarkMode } = useAppStore();
  const { projectId, projects, isDemo, hasProject } = useProjectId();
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const dashboard = useQuery({
    queryKey: ["dashboard", projectId, session?.accessToken],
    queryFn: () => apiFetch<Dashboard>(`/projetos/${projectId}/dashboard`),
    enabled: Boolean(session?.accessToken && projectId && projectId !== "demo")
  });

  const activeProject = useMemo(
    () => projects.data?.find((p) => p.id === projectId),
    [projects.data, projectId]
  );

  const displayDashboard = !isDemo && projectId ? (dashboard.data ?? demoDashboard) : demoDashboard;
  const shareSlug = isDemo ? demoProject.shareSlug : activeProject?.shareSlug;

  const headerTitle = useMemo(() => {
    if (!session?.accessToken) return `Enxoval de ${demoDashboard.projeto.nomeBebe}`;
    if (!projectId) return "Controle de enxoval";
    return `Enxoval de ${displayDashboard.projeto.nomeBebe}`;
  }, [session?.accessToken, projectId, displayDashboard.projeto.nomeBebe]);

  const headerSubtitle = useMemo(() => {
    if (!session?.accessToken) {
      return `${demoDashboard.projeto.temaQuarto ?? ""} · parto em ${date(demoDashboard.projeto.dataPrevistaParto)}`;
    }
    if (!projectId) return "Crie um projeto para comecar.";
    const p = displayDashboard.projeto;
    const tema = p.temaQuarto ? `${p.temaQuarto} · ` : "";
    return `${tema}parto em ${date(p.dataPrevistaParto)}`;
  }, [session?.accessToken, projectId, displayDashboard.projeto]);

  function copyShareLink() {
    if (!shareSlug || typeof window === "undefined") return;
    const url = `${window.location.origin}/publico/listas/${shareSlug}`;
    void navigator.clipboard.writeText(url).then(() => {
      setShareFeedback("Link copiado.");
      setTimeout(() => setShareFeedback(""), 2500);
    });
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[#f8f5ef]/90 backdrop-blur dark:border-white/10 dark:bg-[#1f251f]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-sage-700 text-white">
              <Baby size={22} aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-normal">{headerTitle}</h1>
              <p className="truncate text-sm text-black/60 dark:text-white/65">{headerSubtitle}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <IconButton
                label="Exportar PDF — em breve"
                icon={Download}
                disabled
              />
              <IconButton
                label="Copiar link da lista publica"
                icon={Share2}
                onClick={copyShareLink}
                disabled={!shareSlug}
              />
              <IconButton label="Notificacoes — em breve" icon={Bell} disabled />
              <IconButton
                label={darkMode ? "Tema claro" : "Tema escuro"}
                icon={darkMode ? Sun : Moon}
                onClick={toggleDarkMode}
              />
            </div>
            {shareFeedback ? <span className="text-xs text-sage-700 dark:text-sage-300">{shareFeedback}</span> : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-lg border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/10">
          <nav className="grid gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition hover:bg-sage-50 dark:hover:bg-white/10 ${
                    active
                      ? "bg-sage-100 text-sage-900 dark:bg-white/15 dark:text-white"
                      : "text-black/70 dark:text-white/75"
                  }`}
                >
                  <Icon size={17} aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>

          <ProjectControls projects={projects.data ?? []} projectId={projectId} disabled={!hasProject} />
          <LoginPanel />
        </aside>

        <section className="grid gap-6">
          {!session?.accessToken ? (
            <p className="rounded-lg border border-black/10 bg-white p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/10 dark:text-white/70">
              Voce esta no modo demonstracao. Entre ou cadastre-se para salvar dados no servidor.
            </p>
          ) : null}
          {session?.accessToken && !projectId ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              Crie seu primeiro projeto pelo painel ao lado para habilitar o enxoval online.
            </p>
          ) : null}
          {children}
        </section>
      </div>
    </main>
  );
}
