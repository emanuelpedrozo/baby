"use client";

import { Download, ExternalLink, Pencil, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, uploadImage } from "@/lib/api";
import { ITEM_SORT_OPTIONS, ITEM_STATUS_FILTERS } from "@/lib/item-statuses";
import { money } from "@/lib/format";
import { normalizeProductLink } from "@/lib/product-link";
import { emitToast } from "@/lib/toast";
import { Button } from "@/components/ui";
import { ItemEditModal } from "./item-edit-modal";
import { useProjectId } from "./use-project-id";
import type { Category, Dashboard, ItemEnxoval } from "./types";

function buildGroups(
  items: ItemEnxoval[],
  categories: Category[]
): Array<{ categoria: Category; itens: ItemEnxoval[] }> {
  const map = new Map<string, ItemEnxoval[]>();
  for (const it of items) {
    const key = it.categoria.id ?? it.categoria.nome;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }

  const result: Array<{ categoria: Category; itens: ItemEnxoval[] }> = [];
  for (const cat of categories) {
    result.push({ categoria: cat, itens: map.get(cat.id) ?? [] });
  }

  const remainingKeys = [...map.keys()].filter((k) => !categories.some((c) => c.id === k));
  const orphanItems = remainingKeys.flatMap((k) => map.get(k) ?? []);
  if (orphanItems.length) {
    result.push({ categoria: { id: "_outros", nome: "Outros" }, itens: orphanItems });
  }
  return result;
}

export function ItemsSection() {
  const { session, projectId } = useProjectId();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const [photoSavingId, setPhotoSavingId] = useState<string | null>(null);
  const [itemError, setItemError] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [ordenar, setOrdenar] = useState<"prioridade" | "nome" | "nome_desc">("prioridade");
  const [editingItem, setEditingItem] = useState<ItemEnxoval | null>(null);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);

  const dashboard = useQuery({
    queryKey: ["dashboard", projectId, session?.accessToken],
    queryFn: () => apiFetch<Dashboard>(`/projetos/${projectId}/dashboard`),
    enabled: Boolean(session?.accessToken && projectId)
  });

  const items = useQuery({
    queryKey: ["items", projectId, query, categoriaFiltro, statusFiltro, ordenar, session?.accessToken],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("perPage", "500");
      if (query.trim()) params.set("q", query.trim());
      if (categoriaFiltro) params.set("categoriaId", categoriaFiltro);
      if (statusFiltro) params.set("status", statusFiltro);
      params.set("ordenar", ordenar);
      return apiFetch<{ data: ItemEnxoval[] }>(`/projetos/${projectId}/itens?${params.toString()}`);
    },
    enabled: Boolean(session?.accessToken && projectId)
  });

  const categories = useQuery({
    queryKey: ["categories", projectId, session?.accessToken],
    queryFn: () => apiFetch<Category[]>(`/categorias?projetoId=${projectId}`),
    enabled: Boolean(session?.accessToken && projectId)
  });

  const activeCategories = useMemo(
    () => categories.data ?? dashboard.data?.porCategoria ?? [],
    [categories.data, dashboard.data]
  );
  const rawItems = useMemo(() => items.data?.data ?? [], [items.data]);

  const scopeItems = useMemo(() => {
    return rawItems;
  }, [rawItems]);

  const visibleItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return scopeItems;
    return scopeItems.filter(
      (item) =>
        item.nome.toLowerCase().includes(q) ||
        item.categoria.nome.toLowerCase().includes(q) ||
        (item.linkCompra && item.linkCompra.toLowerCase().includes(q))
    );
  }, [scopeItems, query]);

  const grupos = useMemo(() => {
    if (categoriaFiltro) {
      const cat = activeCategories.find((c) => c.id === categoriaFiltro);
      if (cat) return [{ categoria: cat, itens: visibleItems }];
      return [{ categoria: { id: categoriaFiltro, nome: "Categoria" }, itens: visibleItems }];
    }
    if (!activeCategories.length) {
      return [{ categoria: { id: "_unico", nome: "Itens" }, itens: visibleItems }];
    }
    return buildGroups(visibleItems, activeCategories);
  }, [visibleItems, activeCategories, categoriaFiltro]);

  async function handleItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("nome") ?? "").trim();
    if (!name) return;
    const quantidade = Number(form.get("quantidade") ?? 1);
    const valor = Number(form.get("valor") ?? 0);
    const linkRaw = String(form.get("linkCompra") ?? "");
    const linkCompra = normalizeProductLink(linkRaw);
    const foto = form.get("imagem");
    const imagem = foto instanceof File && foto.size > 0 ? (await uploadImage(foto)).url : undefined;
    const categoriaId = String(
      form.get("categoriaId") || (categoriaFiltro ? categoriaFiltro : "") || activeCategories[0]?.id || ""
    );

    if (!session?.accessToken || !projectId || !categoriaId) return;

    try {
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
          prioridade: "MEDIA",
          ...(linkCompra ? { linkCompra } : {}),
          ...(imagem ? { imagem } : {})
        })
      });
      event.currentTarget.reset();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["items", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] })
      ]);
      emitToast("Item adicionado.", "success");
    } catch (err) {
      emitToast(err instanceof Error ? err.message : "Erro ao adicionar item.", "error");
    }
  }

  async function updateItemPhoto(item: ItemEnxoval, file: File | null) {
    if (!file || !session?.accessToken || !projectId) return;
    setPhotoSavingId(item.id);
    setItemError("");
    try {
      const uploaded = await uploadImage(file);
      await apiFetch(`/projetos/${projectId}/itens/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ imagem: uploaded.url })
      });
      await queryClient.invalidateQueries({ queryKey: ["items", projectId] });
      emitToast("Foto atualizada.", "success");
    } catch (err) {
      setItemError(err instanceof Error ? err.message : "Erro ao enviar foto do item.");
    } finally {
      setPhotoSavingId(null);
    }
  }

  async function invalidateItemQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["items", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] })
    ]);
  }

  async function deleteItem(item: ItemEnxoval) {
    if (!projectId || !session?.accessToken) return;
    if (!window.confirm(`Excluir o item "${item.nome}"? Esta acao pode ser desfeita apenas pelo suporte.`)) return;
    setRowBusyId(item.id);
    try {
      await apiFetch(`/projetos/${projectId}/itens/${item.id}`, { method: "DELETE" });
      await invalidateItemQueries();
      emitToast("Item removido.", "success");
    } catch (err) {
      emitToast(err instanceof Error ? err.message : "Erro ao excluir.", "error");
    } finally {
      setRowBusyId(null);
    }
  }

  async function bumpComprada(item: ItemEnxoval) {
    if (!projectId || !session?.accessToken) return;
    const next = item.quantidadeComprada + 1;
    setRowBusyId(item.id);
    try {
      await apiFetch(`/projetos/${projectId}/itens/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantidadeComprada: next })
      });
      await invalidateItemQueries();
      emitToast("Quantidade comprada atualizada.", "success");
    } catch (err) {
      emitToast(err instanceof Error ? err.message : "Erro ao atualizar.", "error");
    } finally {
      setRowBusyId(null);
    }
  }

  function exportarCsv() {
    const rows = rawItems;
    if (!rows.length) {
      emitToast("Nenhum item para exportar.", "info");
      return;
    }
    const header = ["nome", "categoria", "status", "qtd_necessaria", "qtd_comprada", "qtd_ganha", "valor_estimado", "valor_pago", "link"];
    const esc = (v: string | number | undefined | null) => {
      const s = v == null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const lines = [
      header.join(","),
      ...rows.map((it) =>
        [
          esc(it.nome),
          esc(it.categoria.nome),
          esc(it.status),
          esc(it.quantidadeNecessaria),
          esc(it.quantidadeComprada),
          esc(it.quantidadeGanha),
          esc(it.valorEstimado),
          esc(it.valorPago),
          esc(it.linkCompra ?? "")
        ].join(",")
      )
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `itens-enxoval-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    emitToast("CSV baixado.", "success");
  }

  function limparFiltros() {
    setQuery("");
    setCategoriaFiltro("");
    setStatusFiltro("");
    setOrdenar("prioridade");
  }

  const canPost = Boolean(session?.accessToken && projectId);
  const formCategoriaLocked = Boolean(categoriaFiltro);

  return (
    <>
      <form
        onSubmit={(e) => void handleItem(e)}
        className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10"
      >
        <h2 className="text-base font-semibold">Cadastrar item</h2>
        <p className="mt-1 text-sm text-black/60 dark:text-white/65">
          Escolha a categoria, informe quantidade e valor estimado. O link do produto e opcional (loja, marketplace etc.).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <label className="grid min-w-0 gap-1 text-sm sm:col-span-2 lg:col-span-4">
            Nome do item
            <input
              name="nome"
              required
              className="min-h-10 w-full min-w-0 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              placeholder="Ex.: Paninhos de boca"
            />
          </label>
          <label className="grid min-w-0 gap-1 text-sm sm:col-span-2 lg:col-span-4">
            Categoria
            {categoriaFiltro ? <input type="hidden" name="categoriaId" value={categoriaFiltro} /> : null}
            <select
              name={categoriaFiltro ? undefined : "categoriaId"}
              className="min-h-10 w-full min-w-0 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 disabled:opacity-70 dark:border-white/10 dark:bg-white/10"
              disabled={!canPost || activeCategories.length === 0 || formCategoriaLocked}
              defaultValue={categoriaFiltro || undefined}
              key={categoriaFiltro || "todas"}
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
            {formCategoriaLocked ? (
              <span className="text-xs text-black/55 dark:text-white/55">Categoria definida pelo filtro acima.</span>
            ) : null}
          </label>
          <label className="grid min-w-0 gap-1 text-sm sm:col-span-2 lg:col-span-4">
            Link do produto (opcional)
            <input
              name="linkCompra"
              type="url"
              inputMode="url"
              className="min-h-10 w-full min-w-0 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              placeholder="https:// ou dominio sem https"
            />
          </label>
          <label className="grid min-w-0 gap-1 text-sm sm:col-span-2 lg:col-span-5">
            Foto do item
            <input
              name="imagem"
              type="file"
              accept="image/*"
              className="block min-h-10 w-full min-w-0 max-w-full overflow-hidden rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-sage-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sage-800 focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10 dark:file:bg-white/15 dark:file:text-white"
            />
          </label>
          <label className="grid min-w-0 gap-1 text-sm lg:col-span-2">
            Qtd.
            <input
              name="quantidade"
              type="number"
              min={1}
              defaultValue={1}
              className="min-h-10 w-full min-w-0 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            />
          </label>
          <label className="grid min-w-0 gap-1 text-sm lg:col-span-2">
            Valor estimado
            <input
              name="valor"
              type="number"
              min={0}
              step={0.01}
              defaultValue={0}
              className="min-h-10 w-full min-w-0 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            />
          </label>
          <div className="flex min-w-0 flex-col justify-end sm:col-span-2 lg:col-span-3 [&>button]:w-full">
            <Button type="submit" disabled={!canPost}>
              <Plus size={16} aria-hidden />
              Adicionar item
            </Button>
          </div>
        </div>
        {!canPost ? (
          <p className="mt-2 text-xs text-black/60 dark:text-white/65">Crie um projeto para adicionar itens.</p>
        ) : null}
        {itemError ? <p className="mt-2 text-xs text-clay-600 dark:text-clay-100">{itemError}</p> : null}
      </form>

      <div className="rounded-lg border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
        <div className="flex flex-col gap-4 border-b border-black/10 p-4 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Catalogo por categoria</h2>
            <label className="relative block w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/45 dark:text-white/50" size={16} aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-10 w-full rounded-md border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
                placeholder="Buscar por nome, categoria ou link"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoriaFiltro("")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                categoriaFiltro === ""
                  ? "border-sage-700 bg-sage-100 text-sage-900 dark:border-sage-500 dark:bg-sage-900/40 dark:text-sage-100"
                  : "border-black/15 text-black/70 hover:bg-sage-50 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/10"
              }`}
            >
              Todas
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaFiltro(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  categoriaFiltro === cat.id
                    ? "border-sage-700 bg-sage-100 text-sage-900 dark:border-sage-500 dark:bg-sage-900/40 dark:text-sage-100"
                    : "border-black/15 text-black/70 hover:bg-sage-50 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/10"
                }`}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cat.cor ?? "#718766" }} />
                {cat.nome}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3 border-t border-black/10 pt-4 dark:border-white/10">
            <label className="grid gap-1 text-xs font-medium text-black/70 dark:text-white/70">
              Status
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="min-h-9 min-w-[160px] rounded-md border border-black/10 bg-white px-2 text-sm dark:border-white/10 dark:bg-white/10"
              >
                {ITEM_STATUS_FILTERS.map((s) => (
                  <option key={s.value || "all"} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium text-black/70 dark:text-white/70">
              Ordenar
              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value as "prioridade" | "nome" | "nome_desc")}
                className="min-h-9 min-w-[180px] rounded-md border border-black/10 bg-white px-2 text-sm dark:border-white/10 dark:bg-white/10"
              >
                {ITEM_SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <Button type="button" variant="secondary" onClick={limparFiltros}>
              Limpar filtros
            </Button>
            <Button type="button" variant="secondary" onClick={exportarCsv} disabled={!rawItems.length}>
              <Download size={16} aria-hidden />
              Exportar CSV
            </Button>
          </div>
        </div>

        {items.isLoading ? (
          <div className="space-y-3 p-4" aria-busy="true">
            <div className="h-10 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
            <div className="h-32 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
          </div>
        ) : null}

        <div className={`divide-y divide-black/10 dark:divide-white/10 ${items.isLoading ? "opacity-50" : ""}`}>
          {grupos.map(({ categoria, itens: itensGrupo }) => (
            <div key={categoria.id} className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: categoria.cor ?? "#718766" }} />
                <h3 className="text-sm font-semibold tracking-normal">{categoria.nome}</h3>
                <span className="text-xs text-black/55 dark:text-white/55">({itensGrupo.length} itens)</span>
              </div>
              {itensGrupo.length === 0 ? (
                <p className="text-sm text-black/55 dark:text-white/55">Nenhum item nesta categoria ainda.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
                  <table className="w-full min-w-[1020px] border-collapse text-sm">
                    <thead className="bg-sage-50 text-left text-black/65 dark:bg-white/5 dark:text-white/65">
                      <tr>
                        <th className="px-3 py-2 font-medium">Foto</th>
                        <th className="px-3 py-2 font-medium">Item</th>
                        <th className="px-3 py-2 font-medium">Link</th>
                        <th className="px-3 py-2 font-medium">Qtd.</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 text-right font-medium">Pago</th>
                        <th className="px-3 py-2 text-right font-medium">Acoes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensGrupo.map((item) => {
                        const obtido = item.quantidadeComprada + item.quantidadeGanha;
                        return (
                          <tr key={item.id} className="border-t border-black/10 dark:border-white/10">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                {item.imagem ? (
                                  <span
                                    role="img"
                                    aria-label={item.nome}
                                    className="h-12 w-12 rounded-md bg-cover bg-center"
                                    style={{ backgroundImage: `url(${item.imagem})` }}
                                  />
                                ) : (
                                  <span className="grid h-12 w-12 place-items-center rounded-md border border-dashed border-black/15 text-xs text-black/45 dark:border-white/15 dark:text-white/45">
                                    Sem foto
                                  </span>
                                )}
                                <label className="cursor-pointer rounded-md border border-black/10 px-2 py-1 text-xs font-semibold transition hover:bg-sage-50 dark:border-white/10 dark:hover:bg-white/10">
                                  {photoSavingId === item.id ? "Enviando..." : "Trocar"}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    disabled={photoSavingId === item.id}
                                    onChange={(event) => {
                                      void updateItemPhoto(item, event.target.files?.[0] ?? null);
                                      event.currentTarget.value = "";
                                    }}
                                  />
                                </label>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-medium">{item.nome}</td>
                            <td className="px-3 py-2">
                              {item.linkCompra ? (
                                <a
                                  href={item.linkCompra}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sage-800 underline decoration-sage-400 underline-offset-2 hover:text-sage-600 dark:text-sage-200"
                                >
                                  <ExternalLink size={14} aria-hidden />
                                  Abrir
                                </a>
                              ) : (
                                <span className="text-black/45 dark:text-white/45">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {obtido}/{item.quantidadeNecessaria}
                            </td>
                            <td className="px-3 py-2">
                              <span className="rounded-md bg-sage-100 px-2 py-0.5 text-xs font-semibold text-sage-700">
                                {item.status.replaceAll("_", " ")}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">{money(Number(item.valorPago))}</td>
                            <td className="px-3 py-2 text-right">
                              {canPost ? (
                                <div className="flex flex-wrap justify-end gap-1">
                                  <button
                                    type="button"
                                    title="Editar item"
                                    className="rounded-md border border-black/10 p-1.5 text-black/80 hover:bg-sage-50 disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                                    disabled={rowBusyId === item.id}
                                    onClick={() => setEditingItem(item)}
                                  >
                                    <Pencil size={15} aria-hidden />
                                  </button>
                                  <button
                                    type="button"
                                    title="Somar 1 na quantidade comprada"
                                    className="rounded-md border border-black/10 p-1.5 text-black/80 hover:bg-sage-50 disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                                    disabled={rowBusyId === item.id}
                                    onClick={() => void bumpComprada(item)}
                                  >
                                    <ShoppingCart size={15} aria-hidden />
                                  </button>
                                  <button
                                    type="button"
                                    title="Excluir item"
                                    className="rounded-md border border-clay-200 p-1.5 text-clay-700 hover:bg-clay-50 disabled:opacity-50 dark:border-clay-700 dark:text-clay-200 dark:hover:bg-clay-950/40"
                                    disabled={rowBusyId === item.id}
                                    onClick={() => void deleteItem(item)}
                                  >
                                    <Trash2 size={15} aria-hidden />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-black/40 dark:text-white/40">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {editingItem && projectId && activeCategories.length > 0 ? (
        <ItemEditModal
          item={editingItem}
          categories={activeCategories}
          projectId={projectId}
          onClose={() => setEditingItem(null)}
          onSaved={invalidateItemQueries}
        />
      ) : null}
    </>
  );
}
