"use client";

import { Banknote, PiggyBank, Receipt, Scale, Target, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { money } from "@/lib/format";
import { Metric } from "@/components/ui";
import { useProjectId } from "./use-project-id";
import type { Dashboard } from "./types";

export function FinanceSection() {
  const { session, projectId } = useProjectId();

  const dashboard = useQuery({
    queryKey: ["dashboard", projectId, session?.accessToken],
    queryFn: () => apiFetch<Dashboard>(`/projetos/${projectId}/dashboard`),
    enabled: Boolean(session?.accessToken && projectId)
  });

  if (dashboard.isLoading || !dashboard.data) {
    return (
      <section className="rounded-lg border border-black/10 bg-white p-5 text-sm text-black/60 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/65">
        Carregando financeiro...
      </section>
    );
  }

  const d = dashboard.data;
  const { indicadores, projeto } = d;

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label="Orcamento total" value={money(Number(projeto.orcamentoTotal))} icon={Scale} tone="blue" />
        <Metric label="Custo previsto" value={money(indicadores.custoPrevisto)} icon={Target} />
        <Metric label="Total gasto" value={money(indicadores.totalGasto)} icon={Receipt} tone="clay" />
        <Metric label="Saldo" value={money(indicadores.saldo)} icon={PiggyBank} tone="sage" />
        <Metric label="Economia" value={money(indicadores.economia)} icon={TrendingUp} tone="amber" />
        <Metric label="Excedente" value={money(indicadores.excedente)} icon={Banknote} />
      </section>

      <p className="text-sm text-black/60 dark:text-white/65">
        Valores consolidados do projeto <strong>{projeto.nomeBebe}</strong> ({projeto.moeda}).
      </p>
    </>
  );
}
