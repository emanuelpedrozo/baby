"use client";

import { ClipboardCheck, DollarSign, PackageCheck, Plus, Wallet } from "lucide-react";
import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { money } from "@/lib/format";
import { Button, Metric, ProgressBar } from "@/components/ui";
import { useProjectId } from "./use-project-id";
import type { Category, Dashboard } from "./types";

export function DashboardHome() {
  const { session, projectId } = useProjectId();
  const queryClient = useQueryClient();
  const [catNome, setCatNome] = useState("");
  const [catCor, setCatCor] = useState("#8aa38b");
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState("");
  const [showCatForm, setShowCatForm] = useState(false);

  const dashboard = useQuery({
    queryKey: ["dashboard", projectId, session?.accessToken],
    queryFn: () => apiFetch<Dashboard>(`/projetos/${projectId}/dashboard`),
    enabled: Boolean(session?.accessToken && projectId)
  });

  const categories = useQuery({
    queryKey: ["categories", projectId, session?.accessToken],
    queryFn: () => apiFetch<Category[]>(`/categorias?projetoId=${projectId}`),
    enabled: Boolean(session?.accessToken && projectId)
  });

  const canMutate = Boolean(session?.accessToken && projectId);

  async function addCategory(event: FormEvent) {
    event.preventDefault();
    if (!canMutate || !catNome.trim()) return;
    setCatSaving(true);
    setCatError("");
    try {
      await apiFetch(`/categorias?projetoId=${encodeURIComponent(projectId)}`, {
        method: "POST",
        body: JSON.stringify({
          nome: catNome.trim(),
          cor: catCor,
          prioridade: 0,
          ordem: (categories.data?.length ?? 0) + 1,
          padrao: false
        })
      });
      setCatNome("");
      setShowCatForm(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] })
      ]);
    } catch (err) {
      setCatError(err instanceof Error ? err.message : "Erro ao criar categoria.");
    } finally {
      setCatSaving(false);
    }
  }

  if (dashboard.isLoading || !dashboard.data) {
    return (
      <section className="rounded-lg border border-black/10 bg-white p-5 text-sm text-black/60 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/65">
        Carregando painel do enxoval...
      </section>
    );
  }

  const activeDashboard = dashboard.data;

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Enxoval concluido" value={`${activeDashboard.indicadores.progressoEnxoval}%`} icon={PackageCheck} />
        <Metric label="Total gasto" value={money(activeDashboard.indicadores.totalGasto)} icon={DollarSign} tone="clay" />
        <Metric label="Saldo" value={money(activeDashboard.indicadores.saldo)} icon={Wallet} tone="blue" />
        <Metric label="Checklist hospitalar" value={`${activeDashboard.indicadores.checklistMaternidade}%`} icon={ClipboardCheck} tone="amber" />
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Progresso por categoria</h2>
            <p className="text-sm text-black/60 dark:text-white/65">
              Semana {activeDashboard.indicadores.semanasGestacao}: {activeDashboard.indicadores.proximoPasso}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!canMutate}
              onClick={() => setShowCatForm((v) => !v)}
            >
              <Plus size={16} aria-hidden />
              Categoria
            </Button>
          </div>
        </div>

        {showCatForm && canMutate ? (
          <form onSubmit={addCategory} className="mt-4 grid gap-3 rounded-md border border-black/10 p-4 dark:border-white/10">
            <label className="grid gap-1 text-sm">
              Nome da categoria
              <input
                value={catNome}
                onChange={(e) => setCatNome(e.target.value)}
                required
                className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Cor
              <input
                type="color"
                value={catCor}
                onChange={(e) => setCatCor(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-md border border-black/10 dark:border-white/10"
              />
            </label>
            <Button type="submit" disabled={catSaving}>
              {catSaving ? "Salvando..." : "Adicionar categoria"}
            </Button>
            {catError ? <p className="text-xs text-clay-600 dark:text-clay-100">{catError}</p> : null}
          </form>
        ) : null}

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
      </section>

    </>
  );
}
