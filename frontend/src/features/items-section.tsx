"use client";

import { Plus, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { money } from "@/lib/format";
import { Button } from "@/components/ui";
import { demoItems } from "./demo-data";
import { useProjectId } from "./use-project-id";
import type { Category, Dashboard, ItemEnxoval } from "./types";

export function ItemsSection() {
  const { session, projectId, isDemo } = useProjectId();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [localItems, setLocalItems] = useState(demoItems);

  const dashboard = useQuery({
    queryKey: ["dashboard", projectId, session?.accessToken],
    queryFn: () => apiFetch<Dashboard>(`/projetos/${projectId}/dashboard`),
    enabled: Boolean(session?.accessToken && projectId && projectId !== "demo")
  });

  const items = useQuery({
    queryKey: ["items", projectId, query, session?.accessToken],
    queryFn: () =>
      apiFetch<{ data: ItemEnxoval[] }>(`/projetos/${projectId}/itens?q=${encodeURIComponent(query)}`),
    enabled: Boolean(session?.accessToken && projectId && projectId !== "demo")
  });

  const categories = useQuery({
    queryKey: ["categories", projectId, session?.accessToken],
    queryFn: () => apiFetch<Category[]>(`/categorias?projetoId=${projectId}`),
    enabled: Boolean(session?.accessToken && projectId && projectId !== "demo")
  });

  const activeCategories = categories.data ?? dashboard.data?.porCategoria ?? [];
  const activeItems = items.data?.data ?? localItems;
  const visibleItems = activeItems.filter((item) => item.nome.toLowerCase().includes(query.toLowerCase()));

  async function handleItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("nome") ?? "").trim();
    if (!name) return;
    const quantidade = Number(form.get("quantidade") ?? 1);
    const valor = Number(form.get("valor") ?? 0);
    const categoriaId = String(form.get("categoriaId") || activeCategories[0]?.id || "");

    if (session?.accessToken && projectId && projectId !== "demo" && categoriaId) {
      await apiFetch(`/projetos/${projectId}/itens`, {
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
      });
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

  const canPost = Boolean(session?.accessToken && projectId && projectId !== "demo");

  return (
    <>
      <form
        onSubmit={handleItem}
        className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10"
      >
        <h2 className="text-base font-semibold">Adicionar item rapido</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1 text-sm sm:col-span-2">
            Nome
            <input
              name="nome"
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              placeholder="Ex.: Paninhos de boca"
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            Categoria
            <select
                name="categoriaId"
                className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                disabled={!canPost || activeCategories.length === 0}
              >
                {activeCategories.length === 0 ? (
                  <option value="">Nenhuma categoria</option>
                ) : null}
                {activeCategories.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </label>
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
          <div className="flex flex-col justify-end sm:col-span-2">
            <Button type="submit" disabled={!canPost && !isDemo}>
              <Plus size={16} aria-hidden />
              Adicionar
            </Button>
          </div>
        </div>
        {!canPost && !isDemo ? (
          <p className="mt-2 text-xs text-black/60 dark:text-white/65">Crie um projeto para adicionar itens.</p>
        ) : null}
        {isDemo ? (
          <p className="mt-2 text-xs text-black/60 dark:text-white/65">Modo demo: itens ficam apenas neste navegador.</p>
        ) : null}
      </form>

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
    </>
  );
}
