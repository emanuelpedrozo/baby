"use client";

import {
  Baby,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Download,
  Gift,
  ListChecks,
  Moon,
  PackageCheck,
  Plus,
  Search,
  Share2,
  Sun,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ApiSession } from "@/lib/api";
import { date, money } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { Button, IconButton, Metric, ProgressBar } from "@/components/ui";
import { demoChecklist, demoDashboard, demoItems, demoProject } from "./demo-data";
import type { Category, ChecklistItem, Dashboard, ItemEnxoval, Project } from "./types";

const navItems: Array<[string, LucideIcon]> = [
  ["Dashboard", PackageCheck],
  ["Itens", ListChecks],
  ["Financeiro", Wallet],
  ["Checklist", ClipboardCheck],
  ["Presentes", Gift],
  ["Timeline", CalendarDays]
];

export function DashboardApp() {
  const { session, darkMode, toggleDarkMode } = useAppStore();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [localItems, setLocalItems] = useState(demoItems);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const projects = useQuery({
    queryKey: ["projects", session?.accessToken],
    queryFn: () => apiFetch<Project[]>("/projetos", {}, session?.accessToken),
    enabled: Boolean(session?.accessToken)
  });

  const projectId = projects.data?.[0]?.id ?? demoProject.id;

  const dashboard = useQuery({
    queryKey: ["dashboard", projectId, session?.accessToken],
    queryFn: () => apiFetch<Dashboard>(`/projetos/${projectId}/dashboard`, {}, session?.accessToken),
    enabled: Boolean(session?.accessToken && projectId !== "demo")
  });

  const items = useQuery({
    queryKey: ["items", projectId, query, session?.accessToken],
    queryFn: () =>
      apiFetch<{ data: ItemEnxoval[] }>(
        `/projetos/${projectId}/itens?q=${encodeURIComponent(query)}`,
        {},
        session?.accessToken
      ),
    enabled: Boolean(session?.accessToken && projectId !== "demo")
  });

  const checklist = useQuery({
    queryKey: ["checklist", projectId, session?.accessToken],
    queryFn: () =>
      apiFetch<{ data: ChecklistItem[]; progresso: number }>(`/projetos/${projectId}/checklist`, {}, session?.accessToken),
    enabled: Boolean(session?.accessToken && projectId !== "demo")
  });

  const categories = useQuery({
    queryKey: ["categories", projectId, session?.accessToken],
    queryFn: () => apiFetch<Category[]>(`/categorias?projetoId=${projectId}`, {}, session?.accessToken),
    enabled: Boolean(session?.accessToken && projectId !== "demo")
  });

  const activeDashboard = dashboard.data ?? demoDashboard;
  const activeItems = items.data?.data ?? localItems;
  const activeChecklist = checklist.data?.data ?? demoChecklist;
  const activeCategories = categories.data ?? activeDashboard.porCategoria;
  const visibleItems = activeItems.filter((item) => item.nome.toLowerCase().includes(query.toLowerCase()));

  async function handleItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("nome") ?? "").trim();
    if (!name) return;
    const quantidade = Number(form.get("quantidade") ?? 1);
    const valor = Number(form.get("valor") ?? 0);
    const categoriaId = String(form.get("categoriaId") || activeCategories[0]?.id || "");

    if (session?.accessToken && projectId !== "demo" && categoriaId) {
      await apiFetch(
        `/projetos/${projectId}/itens`,
        {
          method: "POST",
          body: JSON.stringify({
            categoriaId,
            nome: name,
            tamanho: "NAO_APLICAVEL",
            quantidadeNecessaria: quantidade,
            quantidadeComprada: 0,
            quantidadeGanha: 0,
            valorEstimado: valor,
            valorPago: 0,
            prioridade: "MEDIA"
          })
        },
        session.accessToken
      );
      event.currentTarget.reset();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["items", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] })
      ]);
      return;
    }

    setLocalItems((current) => [
      {
        id: crypto.randomUUID(),
        nome: name,
        status: "NAO_INICIADO",
        prioridade: "MEDIA",
        quantidadeNecessaria: quantidade,
        quantidadeComprada: 0,
        quantidadeGanha: 0,
        valorEstimado: valor,
        valorPago: 0,
        categoria: { nome: "Organizacao", cor: "#aaa1bc" }
      },
      ...current
    ]);
    event.currentTarget.reset();
  }

  async function toggleChecklist(item: ChecklistItem, concluido: boolean) {
    if (!session?.accessToken || projectId === "demo") return;

    await apiFetch(
      `/projetos/${projectId}/checklist/${item.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ concluido })
      },
      session.accessToken
    );
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["checklist", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] })
    ]);
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
              <h1 className="truncate text-lg font-semibold tracking-normal">Enxoval de {activeDashboard.projeto.nomeBebe}</h1>
              <p className="truncate text-sm text-black/60 dark:text-white/65">
                {activeDashboard.projeto.temaQuarto} · parto em {date(activeDashboard.projeto.dataPrevistaParto)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton label="Exportar PDF" icon={Download} />
            <IconButton label="Compartilhar lista" icon={Share2} />
            <IconButton label="Notificacoes" icon={Bell} />
            <IconButton label={darkMode ? "Tema claro" : "Tema escuro"} icon={darkMode ? Sun : Moon} onClick={toggleDarkMode} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-lg border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/10">
          <nav className="grid gap-1">
            {navItems.map(([label, Icon]) => (
              <button
                key={String(label)}
                className="flex min-h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-black/70 transition hover:bg-sage-50 dark:text-white/75 dark:hover:bg-white/10"
                type="button"
              >
                <Icon size={17} aria-hidden />
                {label}
              </button>
            ))}
          </nav>

          <LoginPanel />
        </aside>

        <section className="grid gap-6">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Enxoval concluido" value={`${activeDashboard.indicadores.progressoEnxoval}%`} icon={PackageCheck} />
            <Metric label="Total gasto" value={money(activeDashboard.indicadores.totalGasto)} icon={DollarSign} tone="clay" />
            <Metric label="Saldo" value={money(activeDashboard.indicadores.saldo)} icon={Wallet} tone="blue" />
            <Metric label="Checklist hospitalar" value={`${activeDashboard.indicadores.checklistMaternidade}%`} icon={ClipboardCheck} tone="amber" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Progresso por categoria</h2>
                  <p className="text-sm text-black/60 dark:text-white/65">
                    Semana {activeDashboard.indicadores.semanasGestacao}: {activeDashboard.indicadores.proximoPasso}
                  </p>
                </div>
                <Button variant="secondary">
                  <Plus size={16} aria-hidden />
                  Categoria
                </Button>
              </div>
              <div className="mt-5 grid gap-4">
                {activeDashboard.porCategoria.map((categoria) => (
                  <article key={categoria.id} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{categoria.nome}</span>
                      <span className="text-black/60 dark:text-white/65">
                        {categoria.progresso}% · {money(categoria.gasto)}
                      </span>
                    </div>
                    <ProgressBar value={categoria.progresso} color={categoria.cor} />
                  </article>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleItem}
              className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10"
            >
              <h2 className="text-base font-semibold">Adicionar item rapido</h2>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">
                  Nome
                  <input
                    name="nome"
                    className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                    placeholder="Ex.: Paninhos de boca"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Categoria
                  <select
                    name="categoriaId"
                    className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                  >
                    {activeCategories.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1 text-sm">
                    Qtd.
                    <input
                      name="quantidade"
                      type="number"
                      min={1}
                      defaultValue={1}
                      className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Valor
                    <input
                      name="valor"
                      type="number"
                      min={0}
                      defaultValue={0}
                      className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                    />
                  </label>
                </div>
                <Button type="submit">
                  <Plus size={16} aria-hidden />
                  Adicionar
                </Button>
              </div>
            </form>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 p-4 dark:border-white/10">
                <h2 className="text-base font-semibold">Itens do enxoval</h2>
                <label className="relative block w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/45 dark:text-white/50" size={16} aria-hidden />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-h-10 w-full rounded-md border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                    placeholder="Pesquisar itens"
                  />
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead className="bg-sage-50 text-left text-black/65 dark:bg-white/5 dark:text-white/65">
                    <tr>
                      <th className="px-4 py-3 font-medium">Item</th>
                      <th className="px-4 py-3 font-medium">Categoria</th>
                      <th className="px-4 py-3 font-medium">Qtd.</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.map((item) => {
                      const obtido = item.quantidadeComprada + item.quantidadeGanha;
                      return (
                        <tr key={item.id} className="border-t border-black/10 dark:border-white/10">
                          <td className="px-4 py-3 font-medium">{item.nome}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.categoria.cor }} />
                              {item.categoria.nome}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {obtido}/{item.quantidadeNecessaria}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-md bg-sage-100 px-2 py-1 text-xs font-semibold text-sage-700">
                              {item.status.replaceAll("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{money(Number(item.valorPago))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Mala maternidade</h2>
                <CheckCircle2 size={18} className="text-sage-700 dark:text-sage-300" aria-hidden />
              </div>
              <div className="mt-4 grid gap-3">
                {activeChecklist.map((item) => (
                  <label key={item.id} className="flex min-h-10 items-center gap-3 rounded-md border border-black/10 px-3 dark:border-white/10">
                    <input
                      type="checkbox"
                      checked={item.concluido}
                      onChange={(event) => void toggleChecklist(item, event.target.checked)}
                      className="h-4 w-4 accent-sage-700"
                    />
                    <span className="text-sm">{item.nome}</span>
                    <span className="ml-auto rounded bg-black/5 px-2 py-1 text-xs dark:bg-white/10">{item.tipo}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function LoginPanel() {
  const { session, setSession } = useAppStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userLabel = useMemo(() => session?.usuario.nome ?? "Modo demonstracao", [session]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<ApiSession>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          senha: form.get("senha")
        })
      });
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 border-t border-black/10 pt-4 dark:border-white/10">
      <p className="text-sm font-medium">{userLabel}</p>
      {session ? (
        <button className="mt-3 text-sm text-clay-600 dark:text-clay-100" type="button" onClick={() => setSession(undefined)}>
          Sair
        </button>
      ) : (
        <form onSubmit={login} className="mt-3 grid gap-2">
          <input
            name="email"
            type="email"
            defaultValue="demo@baby.local"
            className="min-h-10 rounded-md border border-black/10 px-3 text-sm dark:border-white/10 dark:bg-white/10"
          />
          <input
            name="senha"
            type="password"
            defaultValue="12345678"
            className="min-h-10 rounded-md border border-black/10 px-3 text-sm dark:border-white/10 dark:bg-white/10"
          />
          <Button type="submit" variant="secondary">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          {error ? <p className="text-xs text-clay-600 dark:text-clay-100">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
