"use client";

import { CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { demoChecklist } from "./demo-data";
import { useProjectId } from "./use-project-id";
import type { ChecklistItem } from "./types";

export function ChecklistSection() {
  const { session, projectId } = useProjectId();
  const queryClient = useQueryClient();

  const checklist = useQuery({
    queryKey: ["checklist", projectId, session?.accessToken],
    queryFn: () => apiFetch<{ data: ChecklistItem[]; progresso: number }>(`/projetos/${projectId}/checklist`),
    enabled: Boolean(session?.accessToken && projectId && projectId !== "demo")
  });

  const activeChecklist = checklist.data?.data ?? demoChecklist;
  const progresso = useMemo(() => {
    if (checklist.data) return checklist.data.progresso;
    const done = demoChecklist.filter((i) => i.concluido).length;
    return Math.round((done / demoChecklist.length) * 100);
  }, [checklist.data]);

  async function toggleChecklist(item: ChecklistItem, concluido: boolean) {
    if (!session?.accessToken || !projectId || projectId === "demo") return;

    await apiFetch(`/projetos/${projectId}/checklist/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ concluido })
    });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["checklist", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] })
    ]);
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Mala maternidade</h2>
          <p className="text-sm text-black/60 dark:text-white/65">Progresso: {progresso}%</p>
        </div>
        <CheckCircle2 size={22} className="text-sage-700 dark:text-sage-300" aria-hidden />
      </div>
      <div className="mt-4 grid gap-3">
        {activeChecklist.map((item) => (
          <label key={item.id} className="flex min-h-10 items-center gap-3 rounded-md border border-black/10 px-3 dark:border-white/10">
            <input
              type="checkbox"
              checked={item.concluido}
              onChange={(event) => void toggleChecklist(item, event.target.checked)}
              className="h-4 w-4 accent-sage-700"
              disabled={!session?.accessToken || projectId === "demo"}
            />
            <span className="text-sm">{item.nome}</span>
            <span className="ml-auto rounded bg-black/5 px-2 py-1 text-xs dark:bg-white/10">{item.tipo}</span>
          </label>
        ))}
      </div>
      {!session?.accessToken ? (
        <p className="mt-4 text-xs text-black/60 dark:text-white/65">Modo demonstracao: alteracoes nao sao salvas.</p>
      ) : null}
    </div>
  );
}
