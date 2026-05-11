"use client";

import { Baby, Camera, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, uploadImage } from "@/lib/api";
import { Button } from "@/components/ui";
import { useProjectId } from "./use-project-id";
import type { Project } from "./types";

function toDateInput(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function BabyProfileSection() {
  const { session, projectId, projects } = useProjectId();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const project = useQuery({
    queryKey: ["project", projectId, session?.accessToken],
    queryFn: () => apiFetch<Project>(`/projetos/${projectId}`),
    enabled: Boolean(session?.accessToken && projectId),
    initialData: () => projects.data?.find((p) => p.id === projectId)
  });

  const current = project.data;
  const preview = useMemo(() => current?.fotoQuarto ?? "", [current?.fotoQuarto]);

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectId || !current) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const file = form.get("fotoQuarto");
      const fotoQuarto = file instanceof File && file.size > 0 ? (await uploadImage(file)).url : current.fotoQuarto;
      const updated = await apiFetch<Project>(`/projetos/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          nomeBebe: String(form.get("nomeBebe") ?? "").trim(),
          sexo: String(form.get("sexo") ?? "NAO_INFORMADO"),
          dataPrevistaParto: String(form.get("dataPrevistaParto") ?? ""),
          orcamentoTotal: Number(form.get("orcamentoTotal") ?? 0),
          moeda: current.moeda ?? "BRL",
          temaQuarto: String(form.get("temaQuarto") ?? "").trim() || undefined,
          climaRegiao: String(form.get("climaRegiao") ?? "").trim() || undefined,
          fotoQuarto
        })
      });
      queryClient.setQueryData(["project", projectId, session?.accessToken], updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] })
      ]);
      setFeedback("Dados do bebe atualizados.");
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel atualizar os dados do bebe.");
    } finally {
      setSaving(false);
    }
  }

  if (project.isLoading || !current) {
    return (
      <section className="rounded-lg border border-black/10 bg-white p-5 text-sm text-black/60 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/65">
        Carregando dados do bebe...
      </section>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <form onSubmit={saveProject} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-sage-100 text-sage-700">
            <Baby size={20} aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold">Dados do bebe</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/65">
              Atualize as informacoes principais usadas no cabecalho, dashboard e planejamento.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Nome do bebe
            <input
              name="nomeBebe"
              required
              defaultValue={current.nomeBebe}
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Sexo
              <select
                name="sexo"
                defaultValue={current.sexo}
                className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              >
                <option value="NAO_INFORMADO">Nao informado</option>
                <option value="FEMININO">Feminino</option>
                <option value="MASCULINO">Masculino</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Data prevista do parto
              <input
                name="dataPrevistaParto"
                type="date"
                required
                defaultValue={toDateInput(current.dataPrevistaParto)}
                className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Orcamento total
              <input
                name="orcamentoTotal"
                type="number"
                min={0}
                step={0.01}
                required
                defaultValue={Number(current.orcamentoTotal)}
                className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Clima da regiao
              <input
                name="climaRegiao"
                defaultValue={current.climaRegiao ?? ""}
                placeholder="Ex.: quente, frio, temperado"
                className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            Tema do quarto
            <input
              name="temaQuarto"
              defaultValue={current.temaQuarto ?? ""}
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Foto do quarto
            <input
              name="fotoQuarto"
              type="file"
              accept="image/*"
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-sage-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sage-800 focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10 dark:file:bg-white/15 dark:file:text-white"
            />
          </label>
          <Button type="submit" disabled={saving}>
            <Save size={16} aria-hidden />
            {saving ? "Salvando..." : "Salvar dados do bebe"}
          </Button>
          {feedback ? <p className="text-sm text-sage-700 dark:text-sage-200">{feedback}</p> : null}
          {error ? <p className="text-sm text-clay-600 dark:text-clay-100">{error}</p> : null}
        </div>
      </form>

      <aside className="h-fit rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
        <div className="flex items-center gap-2">
          <Camera size={18} aria-hidden />
          <h3 className="text-sm font-semibold">Foto atual do quarto</h3>
        </div>
        {preview ? (
          <div
            role="img"
            aria-label={`Quarto de ${current.nomeBebe}`}
            className="mt-4 aspect-[4/3] w-full rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url(${preview})` }}
          />
        ) : (
          <div className="mt-4 grid aspect-[4/3] place-items-center rounded-md border border-dashed border-black/15 text-center text-sm text-black/55 dark:border-white/15 dark:text-white/55">
            Nenhuma foto cadastrada.
          </div>
        )}
      </aside>
    </section>
  );
}
