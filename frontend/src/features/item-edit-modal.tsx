"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { apiFetch, uploadImage } from "@/lib/api";
import { normalizeProductLink } from "@/lib/product-link";
import { emitToast } from "@/lib/toast";
import { Button } from "@/components/ui";
import { PRIORIDADE_OPTIONS } from "@/lib/item-statuses";
import type { Category, ItemEnxoval } from "@/features/types";

export function ItemEditModal({
  item,
  categories,
  projectId,
  onClose,
  onSaved
}: {
  item: ItemEnxoval;
  categories: Category[];
  projectId: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const focusable = el.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nome = String(form.get("nome") ?? "").trim();
    if (!nome) return;
    const categoriaId = String(form.get("categoriaId") ?? "");
    const quantidadeNecessaria = Number(form.get("quantidadeNecessaria") ?? 1);
    const quantidadeComprada = Number(form.get("quantidadeComprada") ?? 0);
    const quantidadeGanha = Number(form.get("quantidadeGanha") ?? 0);
    const valorEstimado = Number(form.get("valorEstimado") ?? 0);
    const valorPago = Number(form.get("valorPago") ?? 0);
    const prioridade = String(form.get("prioridade") ?? "MEDIA");
    const linkRaw = String(form.get("linkCompra") ?? "");
    const linkCompra = normalizeProductLink(linkRaw);
    const foto = form.get("imagem");

    setSaving(true);
    try {
      let imagem: string | undefined;
      if (foto instanceof File && foto.size > 0) {
        const up = await uploadImage(foto);
        imagem = up.url;
      }

      await apiFetch(`/projetos/${projectId}/itens/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nome,
          categoriaId,
          tamanho: "NAO_APLICAVEL",
          quantidadeNecessaria,
          quantidadeComprada,
          quantidadeGanha,
          valorEstimado,
          valorPago,
          prioridade,
          ...(linkCompra ? { linkCompra } : {}),
          ...(imagem ? { imagem } : {})
        })
      });
      emitToast("Item atualizado.", "success");
      await onSaved();
      onClose();
    } catch (err) {
      emitToast(err instanceof Error ? err.message : "Erro ao salvar.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-edit-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-black/10 bg-white p-5 shadow-xl outline-none dark:border-white/10 dark:bg-[#1f251f]"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="item-edit-title" className="text-lg font-semibold">
            Editar item
          </h2>
          <button type="button" className="text-sm text-black/60 underline dark:text-white/65" onClick={onClose}>
            Fechar
          </button>
        </div>
        <form onSubmit={(e) => void submit(e)} className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            Nome
            <input
              name="nome"
              required
              defaultValue={item.nome}
              className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Categoria
            <select
              name="categoriaId"
              required
              defaultValue={item.categoria.id ?? categories[0]?.id}
              key={`${item.id}-cat`}
              className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              Qtd. necessaria
              <input
                name="quantidadeNecessaria"
                type="number"
                min={1}
                defaultValue={item.quantidadeNecessaria}
                className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Prioridade
              <select
                name="prioridade"
                defaultValue={item.prioridade}
                className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
              >
                {PRIORIDADE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Comprada
              <input
                name="quantidadeComprada"
                type="number"
                min={0}
                defaultValue={item.quantidadeComprada}
                className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Ganha
              <input
                name="quantidadeGanha"
                type="number"
                min={0}
                defaultValue={item.quantidadeGanha}
                className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Valor estimado
              <input
                name="valorEstimado"
                type="number"
                min={0}
                step={0.01}
                defaultValue={Number(item.valorEstimado)}
                className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Valor pago
              <input
                name="valorPago"
                type="number"
                min={0}
                step={0.01}
                defaultValue={Number(item.valorPago)}
                className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            Link do produto
            <input
              name="linkCompra"
              type="url"
              defaultValue={item.linkCompra ?? ""}
              className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
              placeholder="https://"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Nova foto (opcional)
            <input name="imagem" type="file" accept="image/*" className="text-sm" />
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
