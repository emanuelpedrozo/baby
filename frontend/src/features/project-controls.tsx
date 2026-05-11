"use client";

import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";
import type { Project } from "./types";

const sexoOptions = [
  { value: "NAO_INFORMADO", label: "Nao informado" },
  { value: "FEMININO", label: "Feminino" },
  { value: "MASCULINO", label: "Masculino" }
] as const;

export function ProjectControls({
  projects,
  projectId,
  disabled
}: {
  projects: Project[];
  projectId: string;
  disabled?: boolean;
}) {
  const { session, setSelectedProjectId } = useAppStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  if (!session?.accessToken) return null;

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setCreating(true);
    setError("");
    try {
      const nomeBebe = String(form.get("nomeBebe") ?? "").trim();
      const orcamento = Number(form.get("orcamentoTotal") ?? 0);
      const dataPrevistaParto = String(form.get("dataPrevistaParto") ?? "");
      const sexo = String(form.get("sexo") ?? "NAO_INFORMADO");
      const temaQuarto = String(form.get("temaQuarto") ?? "").trim() || undefined;

      const created = await apiFetch<Project>("/projetos", {
        method: "POST",
        body: JSON.stringify({
          nomeBebe,
          sexo,
          dataPrevistaParto,
          orcamentoTotal: orcamento,
          moeda: "BRL",
          temaQuarto
        })
      });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedProjectId(created.id);
      setOpen(false);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar o projeto.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mt-4 border-t border-black/10 pt-4 dark:border-white/10">
      <label className="grid gap-1 text-xs font-medium text-black/70 dark:text-white/70">
        Projeto ativo
        <select
          disabled={Boolean(disabled) || projects.length === 0}
          value={projects.some((p) => p.id === projectId) ? projectId : ""}
          onChange={(e) => setSelectedProjectId(e.target.value || undefined)}
          className="min-h-9 rounded-md border border-black/10 bg-white px-2 text-sm dark:border-white/10 dark:bg-white/10"
        >
          {projects.length === 0 ? <option value="">Nenhum projeto</option> : null}
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nomeBebe}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="mt-2 text-xs font-medium text-sage-800 underline dark:text-sage-200"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Fechar novo projeto" : "Novo projeto"}
      </button>

      {open ? (
        <form onSubmit={createProject} className="mt-3 grid gap-2 rounded-md border border-black/10 p-3 dark:border-white/10">
          <input
            name="nomeBebe"
            required
            placeholder="Nome do bebe"
            className="min-h-9 rounded-md border border-black/10 px-2 text-sm dark:border-white/10 dark:bg-white/10"
          />
          <select
            name="sexo"
            defaultValue="NAO_INFORMADO"
            className="min-h-9 rounded-md border border-black/10 px-2 text-sm dark:border-white/10 dark:bg-white/10"
          >
            {sexoOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            name="dataPrevistaParto"
            type="date"
            required
            className="min-h-9 rounded-md border border-black/10 px-2 text-sm dark:border-white/10 dark:bg-white/10"
          />
          <input
            name="orcamentoTotal"
            type="number"
            min={0}
            step={0.01}
            required
            placeholder="Orcamento total"
            className="min-h-9 rounded-md border border-black/10 px-2 text-sm dark:border-white/10 dark:bg-white/10"
          />
          <input
            name="temaQuarto"
            placeholder="Tema do quarto (opcional)"
            className="min-h-9 rounded-md border border-black/10 px-2 text-sm dark:border-white/10 dark:bg-white/10"
          />
          <Button type="submit" variant="secondary" disabled={creating}>
            {creating ? "Salvando..." : "Criar projeto"}
          </Button>
          {error ? <p className="text-xs text-clay-600 dark:text-clay-100">{error}</p> : null}
        </form>
      ) : null}
    </div>
  );
}
