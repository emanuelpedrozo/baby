"use client";

import { Edit3, Plus, Save, Tags, Trash2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui";
import { useProjectId } from "./use-project-id";
import type { Category } from "./types";

type CategoryFormState = {
  nome: string;
  cor: string;
  icone: string;
  prioridade: string;
  ordem: string;
};

const initialForm: CategoryFormState = {
  nome: "",
  cor: "#8aa38b",
  icone: "",
  prioridade: "0",
  ordem: "0"
};

function buildPayload(form: CategoryFormState, padrao = false) {
  return {
    nome: form.nome.trim(),
    cor: form.cor,
    icone: form.icone.trim() || undefined,
    prioridade: Number(form.prioridade || 0),
    ordem: Number(form.ordem || 0),
    padrao
  };
}

function categoryToForm(category: Category): CategoryFormState {
  return {
    nome: category.nome,
    cor: category.cor ?? "#8aa38b",
    icone: category.icone ?? "",
    prioridade: String(category.prioridade ?? 0),
    ordem: String(category.ordem ?? 0)
  };
}

export function CategoriesSection() {
  const { session, projectId } = useProjectId();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories = useQuery({
    queryKey: ["categories", projectId, session?.accessToken],
    queryFn: () => apiFetch<Category[]>(`/categorias?projetoId=${projectId}`),
    enabled: Boolean(session?.accessToken && projectId)
  });

  const sortedCategories = useMemo(() => categories.data ?? [], [categories.data]);
  const canMutate = Boolean(session?.accessToken && projectId);

  async function refreshProjectData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["categories", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["items", projectId] })
    ]);
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canMutate || !form.nome.trim()) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/categorias?projetoId=${encodeURIComponent(projectId)}`, {
        method: "POST",
        body: JSON.stringify(buildPayload({ ...form, ordem: form.ordem || String(sortedCategories.length + 1) }))
      });
      setForm({ ...initialForm, ordem: String(sortedCategories.length + 2) });
      await refreshProjectData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar categoria.");
    } finally {
      setSaving(false);
    }
  }

  async function updateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canMutate || !editingId || !editForm.nome.trim()) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/categorias/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(buildPayload(editForm))
      });
      setEditingId(null);
      await refreshProjectData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar categoria.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category: Category) {
    if (!canMutate) return;
    const ok = window.confirm(`Excluir a categoria "${category.nome}"?`);
    if (!ok) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/categorias/${category.id}`, { method: "DELETE" });
      if (editingId === category.id) setEditingId(null);
      await refreshProjectData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir categoria.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditForm(categoryToForm(category));
    setError("");
  }

  if (categories.isLoading) {
    return (
      <section className="rounded-lg border border-black/10 bg-white p-5 text-sm text-black/60 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/65">
        Carregando categorias...
      </section>
    );
  }

  return (
    <section className="grid gap-5">
      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-sage-100 text-sage-700">
            <Tags size={20} aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold">Categorias do enxoval</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/65">
              Organize os grupos usados nos itens, dashboard financeiro e lista de presentes.
            </p>
          </div>
        </div>

        <form onSubmit={createCategory} className="mt-5 grid gap-3 lg:grid-cols-[1.4fr_120px_1fr_110px_110px_auto]">
          <label className="grid gap-1 text-sm">
            Nome
            <input
              value={form.nome}
              onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
              required
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              placeholder="Ex.: Roupas G"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Cor
            <input
              type="color"
              value={form.cor}
              onChange={(e) => setForm((prev) => ({ ...prev, cor: e.target.value }))}
              className="h-10 w-full cursor-pointer rounded-md border border-black/10 dark:border-white/10"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Icone
            <input
              value={form.icone}
              onChange={(e) => setForm((prev) => ({ ...prev, icone: e.target.value }))}
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              placeholder="shirt"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Prioridade
            <input
              type="number"
              min="0"
              value={form.prioridade}
              onChange={(e) => setForm((prev) => ({ ...prev, prioridade: e.target.value }))}
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Ordem
            <input
              type="number"
              min="0"
              value={form.ordem}
              onChange={(e) => setForm((prev) => ({ ...prev, ordem: e.target.value }))}
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            />
          </label>
          <div className="grid items-end">
            <Button type="submit" disabled={!canMutate || saving}>
              <Plus size={16} aria-hidden />
              Cadastrar
            </Button>
          </div>
        </form>

        {error ? <p className="mt-3 text-sm text-clay-600 dark:text-clay-100">{error}</p> : null}
      </section>

      <section className="overflow-x-auto rounded-lg border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
        <div className="grid min-h-11 min-w-[760px] grid-cols-[1fr_120px_110px_110px_130px] items-center gap-3 border-b border-black/10 px-4 text-xs font-semibold uppercase text-black/55 dark:border-white/10 dark:text-white/55">
          <span>Categoria</span>
          <span>Cor</span>
          <span>Prioridade</span>
          <span>Ordem</span>
          <span className="text-right">Acoes</span>
        </div>

        {sortedCategories.length === 0 ? (
          <p className="p-4 text-sm text-black/60 dark:text-white/65">Nenhuma categoria cadastrada ainda.</p>
        ) : (
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {sortedCategories.map((category) =>
              editingId === category.id ? (
                <form
                  key={category.id}
                  onSubmit={updateCategory}
                  className="grid min-w-[760px] gap-3 p-4 lg:grid-cols-[1fr_120px_1fr_110px_110px_130px]"
                >
                  <input
                    value={editForm.nome}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, nome: e.target.value }))}
                    required
                    className="min-h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                  />
                  <input
                    type="color"
                    value={editForm.cor}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, cor: e.target.value }))}
                    className="h-10 w-full cursor-pointer rounded-md border border-black/10 dark:border-white/10"
                  />
                  <input
                    value={editForm.icone}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, icone: e.target.value }))}
                    className="min-h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                    placeholder="Icone"
                  />
                  <input
                    type="number"
                    min="0"
                    value={editForm.prioridade}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, prioridade: e.target.value }))}
                    className="min-h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                  />
                  <input
                    type="number"
                    min="0"
                    value={editForm.ordem}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, ordem: e.target.value }))}
                    className="min-h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="grid h-10 w-10 place-items-center rounded-md bg-sage-700 text-white transition hover:bg-sage-500 disabled:pointer-events-none disabled:opacity-50"
                      aria-label="Salvar categoria"
                      title="Salvar categoria"
                    >
                      <Save size={17} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="grid h-10 w-10 place-items-center rounded-md border border-black/10 bg-white transition hover:bg-sage-50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
                      aria-label="Cancelar edicao"
                      title="Cancelar edicao"
                    >
                      <X size={17} aria-hidden />
                    </button>
                  </div>
                </form>
              ) : (
                <article
                  key={category.id}
                  className="grid min-h-14 min-w-[760px] grid-cols-[1fr_120px_110px_110px_130px] items-center gap-3 px-4 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.cor ?? "#8aa38b" }} />
                    <div className="min-w-0">
                      <strong className="block truncate font-semibold">{category.nome}</strong>
                      {category.icone ? <span className="text-xs text-black/50 dark:text-white/50">{category.icone}</span> : null}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-black/60 dark:text-white/65">{category.cor ?? "-"}</span>
                  <span>{category.prioridade ?? 0}</span>
                  <span>{category.ordem ?? 0}</span>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="grid h-9 w-9 place-items-center rounded-md border border-black/10 bg-white transition hover:bg-sage-50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
                      aria-label={`Editar ${category.nome}`}
                      title="Editar"
                    >
                      <Edit3 size={16} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category)}
                      className="grid h-9 w-9 place-items-center rounded-md border border-black/10 bg-white text-clay-600 transition hover:bg-clay-50 dark:border-white/10 dark:bg-white/10 dark:text-clay-100 dark:hover:bg-white/15"
                      aria-label={`Excluir ${category.nome}`}
                      title="Excluir"
                    >
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </section>
  );
}
