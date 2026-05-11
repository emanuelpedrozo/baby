"use client";

import { useAppStore } from "@/lib/store";
import { BabyProjectSetup } from "./baby-project-setup";
import type { Project } from "./types";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  if (!session?.accessToken) return null;

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
        {open ? "Fechar cadastro" : "Cadastrar outro bebe"}
      </button>

      {open ? (
        <div className="mt-3 rounded-md border border-black/10 p-3 dark:border-white/10">
          <BabyProjectSetup compact onCreated={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
