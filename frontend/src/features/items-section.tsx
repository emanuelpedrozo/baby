"use client";

import { ExternalLink, Plus, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, uploadImage } from "@/lib/api";
import { money } from "@/lib/format";
import { normalizeProductLink } from "@/lib/product-link";
import { Button } from "@/components/ui";
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

  const dashboard = useQuery({
    queryKey: ["dashboard", projectId, session?.accessToken],
    queryFn: () => apiFetch<Dashboard>(`/projetos/${projectId}/dashboard`),
    enabled: Boolean(session?.accessToken && projectId)
  });

  const items = useQuery({
    queryKey: ["items", projectId, query, categoriaFiltro, session?.accessToken],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("perPage", "500");
      if (query.trim()) params.set("q", query.trim());
      if (categoriaFiltro) params.set("categoriaId", categoriaFiltro);
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
    } catch (err) {
      setItemError(err instanceof Error ? err.message : "Erro ao enviar foto do item.");
    } finally {
      setPhotoSavingId(null);
    }
  }

  const canPost = Boolean(session?.accessToken && projectId);
  const formCategoriaLocked = Boolean(categoriaFiltro);

  return (
    <>
      <form
        onSubmit={handleItem}
        className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10"
      >
        <h2 className="text-base font-semibold">Cadastrar item</h2>
        <p className="mt-1 text-sm text-black/60 dark:text-white/65">
          Escolha a categoria, informe quantidade e valor estimado. O link do produto e opcional (loja, marketplace etc.).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="grid gap-1 text-sm sm:col-span-2 lg:col-span-2">
            Nome do item
            <input
              name="nome"
              required
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              placeholder="Ex.: Paninhos de boca"
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2 lg:col-span-2">
            Categoria
            {categoriaFiltro ? <input type="hidden" name="categoriaId" value={categoriaFiltro} /> : null}
            <select
              name={categoriaFiltro ? undefined : "categoriaId"}
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 disabled:opacity-70 dark:border-white/10 dark:bg-white/10"
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
          <label className="grid gap-1 text-sm lg:col-span-2">
            Link do produto (opcional)
            <input
              name="linkCompra"
              type="url"
              inputMode="url"
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
              placeholder="https:// ou dominio sem https"
            />
          </label>
          <label className="grid gap-1 text-sm lg:col-span-2">
            Foto do item
            <input
              name="imagem"
              type="file"
              accept="image/*"
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-sage-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sage-800 focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10 dark:file:bg-white/15 dark:file:text-white"
            />
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
            Valor estimado
            <input
              name="valor"
              type="number"
              min={0}
              step={0.01}
              defaultValue={0}
              className="min-h-10 rounded-md border border-black/10 bg-white px-3 outline-none focus:ring-2 focus:ring-sage-500 dark:border-white/10 dark:bg-white/10"
            />
          </label>
          <div className="flex flex-col justify-end lg:col-span-2">
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
        </div>

        <div className="divide-y divide-black/10 dark:divide-white/10">
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
                  <table className="w-full min-w-[920px] border-collapse text-sm">
                    <thead className="bg-sage-50 text-left text-black/65 dark:bg-white/5 dark:text-white/65">
                      <tr>
                        <th className="px-3 py-2 font-medium">Foto</th>
                        <th className="px-3 py-2 font-medium">Item</th>
                        <th className="px-3 py-2 font-medium">Link</th>
                        <th className="px-3 py-2 font-medium">Qtd.</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 text-right font-medium">Pago</th>
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
    </>
  );
}
