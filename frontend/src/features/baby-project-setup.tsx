"use client";

import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Baby, Plus } from "lucide-react";
import { apiFetch, uploadImage } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";
import type { Project } from "./types";

const sexoOptions = [
  { value: "NAO_INFORMADO", label: "Nao informado" },
  { value: "FEMININO", label: "Feminino" },
  { value: "MASCULINO", label: "Masculino" }
] as const;

export function BabyProjectSetup({ compact = false, onCreated }: { compact?: boolean; onCreated?: () => void }) {
  const { setSelectedProjectId } = useAppStore();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const nomeBebe = String(form.get("nomeBebe") ?? "").trim();
      const orcamento = Number(form.get("orcamentoTotal") ?? 0);
      const dataPrevistaParto = String(form.get("dataPrevistaParto") ?? "");
      const sexo = String(form.get("sexo") ?? "NAO_INFORMADO");
      const temaQuarto = String(form.get("temaQuarto") ?? "").trim() || undefined;
      const climaRegiao = String(form.get("climaRegiao") ?? "").trim() || undefined;
      const foto = form.get("fotoQuarto");
      const fotoQuarto = foto instanceof File && foto.size > 0 ? (await uploadImage(foto)).url : undefined;

      const created = await apiFetch<Project>("/projetos", {
        method: "POST",
        body: JSON.stringify({
          nomeBebe,
          sexo,
          dataPrevistaParto,
          orcamentoTotal: orcamento,
          moeda: "BRL",
          temaQuarto,
          climaRegiao,
          fotoQuarto
        })
      });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedProjectId(created.id);
      event.currentTarget.reset();
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel cadastrar o bebe.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={compact ? "" : "mx-auto max-w-2xl rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/10"}>
      {!compact ? (
        <div className="mb-5 flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-sage-700 text-white">
            <Baby size={22} aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Cadastre o bebe</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/65">
              Essas informacoes criam o projeto principal do enxoval e habilitam os modulos do sistema.
            </p>
          </div>
        </div>
      ) : null}

      <form onSubmit={createProject} className="grid gap-3">
        <label className="grid gap-1 text-sm">
          Nome do bebe
          <input
            name="nomeBebe"
            required
            placeholder="Ex.: Caio Emanuel"
            className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Sexo
            <select
              name="sexo"
              defaultValue="NAO_INFORMADO"
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            >
              {sexoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Data prevista do parto
            <input
              name="dataPrevistaParto"
              type="date"
              required
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
              placeholder="6500"
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Clima da regiao
            <input
              name="climaRegiao"
              placeholder="Ex.: quente, frio, temperado"
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Tema do quarto
          <input
            name="temaQuarto"
            placeholder="Opcional"
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
          <Plus size={16} aria-hidden />
          {saving ? "Salvando..." : "Cadastrar bebe"}
        </Button>
        {error ? <p className="text-xs text-clay-600 dark:text-clay-100">{error}</p> : null}
      </form>
    </div>
  );
}
