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
  Tags,
  UserRound,
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
import { BabyProjectSetup } from "./baby-project-setup";
import { LoginPanel } from "./login-panel";
import { ProjectControls } from "./project-controls";
import { useProjectId } from "./use-project-id";
import type { Dashboard } from "./types";

const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Dashboard", icon: PackageCheck },
  { href: "/bebe", label: "Bebe", icon: UserRound },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/itens", label: "Itens", icon: ListChecks },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/checklist", label: "Checklist", icon: ClipboardCheck },
  { href: "/presentes", label: "Presentes", icon: Gift }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, darkMode, toggleDarkMode } = useAppStore();
  const { projectId, projects, hasProject } = useProjectId();
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const dashboard = useQuery({
    queryKey: ["dashboard", projectId, session?.accessToken],
    queryFn: () => apiFetch<Dashboard>(`/projetos/${projectId}/dashboard`),
    enabled: Boolean(session?.accessToken && projectId)
  });

  const activeProject = useMemo(
    () => projects.data?.find((p) => p.id === projectId),
    [projects.data, projectId]
  );

  const displayProject = dashboard.data?.projeto ?? activeProject;
  const shareSlug = activeProject?.shareSlug;

  const headerTitle = useMemo(() => {
    if (!session?.accessToken) return "Controle de enxoval";
    if (!displayProject) return "Cadastre o bebe";
    return `Enxoval de ${displayProject.nomeBebe}`;
  }, [session?.accessToken, displayProject]);

  const headerSubtitle = useMemo(() => {
    if (!session?.accessToken) {
      return "Entre ou crie sua conta para comecar.";
    }
    if (!displayProject) return "Preencha os dados iniciais para habilitar o painel.";
    const p = displayProject;
    const tema = p.temaQuarto ? `${p.temaQuarto} · ` : "";
    return `${tema}parto em ${date(p.dataPrevistaParto)}`;
  }, [session?.accessToken, displayProject]);

  function copyShareLink() {
    if (!shareSlug || typeof window === "undefined") return;
    const url = `${window.location.origin}/publico/listas/${shareSlug}`;
    void navigator.clipboard.writeText(url).then(() => {
      setShareFeedback("Link copiado.");
      setTimeout(() => setShareFeedback(""), 2500);
    });
  }

  if (!session?.accessToken) {
    return (
      <main className="min-h-screen">
        <header className="border-b border-black/10 bg-[#f8f5ef]/90 dark:border-white/10 dark:bg-[#1f251f]/90">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-sage-700 text-white">
                <Baby size={22} aria-hidden />
              </span>
              <div>
                <h1 className="text-lg font-semibold tracking-normal">Controle de enxoval</h1>
                <p className="text-sm text-black/60 dark:text-white/65">Organize seu enxoval com dados salvos no servidor.</p>
              </div>
            </div>
            <IconButton
              label={darkMode ? "Tema claro" : "Tema escuro"}
              icon={darkMode ? Sun : Moon}
              onClick={toggleDarkMode}
            />
          </div>
        </header>
        <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-5xl items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal">Comece cadastrando sua conta e o bebe.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-black/65 dark:text-white/70">
              Depois do cadastro, voce cria o projeto do bebe, adiciona categorias, itens, checklist da maternidade e gera a lista publica de presentes.
            </p>
          </div>
          <aside className="rounded-lg border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
            <LoginPanel />
          </aside>
        </section>
      </main>
    );
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
          {projects.isLoading ? (
            <section className="rounded-lg border border-black/10 bg-white p-5 text-sm text-black/60 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/65">
              Carregando seus projetos...
            </section>
          ) : !projectId ? (
            <BabyProjectSetup />
          ) : (
            children
          )}
        </section>
      </div>
    </main>
  );
}
