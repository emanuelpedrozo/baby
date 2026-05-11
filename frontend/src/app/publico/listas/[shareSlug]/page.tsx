"use client";

import { ExternalLink, Gift } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { publicApiFetch } from "@/lib/api";
import { date } from "@/lib/format";
import { Button } from "@/components/ui";

type PublicLista = {
  projeto: {
    id: string;
    nomeBebe: string;
    temaQuarto: string | null;
    dataPrevistaParto: string;
  };
  itens: Array<{
    id: string;
    nome: string;
    disponivelParaReserva: boolean;
    quantidadeNecessaria: number;
    quantidadeComprada: number;
    quantidadeGanha: number;
    linkCompra?: string | null;
    categoria: { nome: string };
  }>;
};

export default function PublicGiftListPage() {
  const params = useParams();
  const shareSlug = typeof params.shareSlug === "string" ? params.shareSlug : "";
  const queryClient = useQueryClient();
  const [reserveMsg, setReserveMsg] = useState("");

  const listaQuery = useQuery({
    queryKey: ["public-lista", shareSlug],
    queryFn: () => publicApiFetch<PublicLista>(`/publico/listas/${encodeURIComponent(shareSlug)}`),
    enabled: Boolean(shareSlug)
  });

  const reserveMutation = useMutation({
    mutationFn: async ({ itemId, body }: { itemId: string; body: Record<string, string | undefined> }) => {
      await publicApiFetch(`/publico/listas/${encodeURIComponent(shareSlug)}/itens/${itemId}/reservas`, {
        method: "POST",
        body: JSON.stringify(body)
      });
    },
    onSuccess: async () => {
      setReserveMsg("Reserva registrada. Obrigado!");
      await queryClient.invalidateQueries({ queryKey: ["public-lista", shareSlug] });
    },
    onError: (err: unknown) => {
      setReserveMsg(err instanceof Error ? err.message : "Nao foi possivel reservar.");
    }
  });

  async function reserve(event: FormEvent<HTMLFormElement>, itemId: string) {
    event.preventDefault();
    if (!shareSlug) return;
    setReserveMsg("");
    const form = new FormData(event.currentTarget);
    await reserveMutation.mutateAsync({
      itemId,
      body: {
        nomeVisitante: String(form.get("nomeVisitante") ?? "").trim(),
        emailVisitante: String(form.get("emailVisitante") ?? "").trim() || undefined,
        telefone: String(form.get("telefone") ?? "").trim() || undefined
      }
    });
    event.currentTarget.reset();
  }

  if (listaQuery.isLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
        <p className="text-sm text-black/60 dark:text-white/65">Carregando lista...</p>
      </main>
    );
  }

  const errMessage = listaQuery.error instanceof Error ? listaQuery.error.message : "Lista indisponivel.";
  if (listaQuery.isError || !listaQuery.data) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
        <p className="text-sm text-clay-600 dark:text-clay-200">{errMessage}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-sage-800 underline dark:text-sage-200">
          Voltar ao inicio
        </Link>
      </main>
    );
  }

  const { projeto, itens } = listaQuery.data;

  return (
    <main className="min-h-screen bg-[#f8f5ef] dark:bg-[#1f251f]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-sage-700 text-white">
              <Gift size={24} aria-hidden />
            </span>
            <div>
              <h1 className="text-xl font-semibold">Lista de presentes · {projeto.nomeBebe}</h1>
              <p className="mt-1 text-sm text-black/60 dark:text-white/65">
                {projeto.temaQuarto ? `${projeto.temaQuarto} · ` : ""}
                chegada prevista em {date(projeto.dataPrevistaParto)}
              </p>
            </div>
          </div>
          <Link href="/" className="text-sm font-medium text-sage-800 underline dark:text-sage-200">
            Painel do responsavel
          </Link>
        </header>

        {reserveMsg ? (
          <p className="mb-4 rounded-md border border-sage-200 bg-sage-50 px-3 py-2 text-sm text-sage-900 dark:border-sage-800 dark:bg-sage-950/50 dark:text-sage-100">
            {reserveMsg}
          </p>
        ) : null}

        <ul className="grid gap-4">
          {itens.map((item) => {
            const obtido = item.quantidadeComprada + item.quantidadeGanha;
            const completo = obtido >= item.quantidadeNecessaria;
            return (
              <li
                key={item.id}
                className="rounded-lg border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{item.nome}</h2>
                    <p className="text-sm text-black/60 dark:text-white/65">
                      {item.categoria.nome} · {obtido}/{item.quantidadeNecessaria} obtidos
                      {completo ? " · completo" : ""}
                    </p>
                    {item.linkCompra ? (
                      <a
                        href={item.linkCompra}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-sage-800 underline decoration-sage-400 underline-offset-2 dark:text-sage-200"
                      >
                        <ExternalLink size={14} aria-hidden />
                        Ver produto
                      </a>
                    ) : null}
                  </div>
                  {!completo && item.disponivelParaReserva ? (
                    <span className="rounded bg-sage-100 px-2 py-1 text-xs font-medium text-sage-800 dark:bg-sage-900/50 dark:text-sage-200">
                      Disponivel
                    </span>
                  ) : null}
                  {!completo && !item.disponivelParaReserva ? (
                    <span className="rounded bg-black/5 px-2 py-1 text-xs dark:bg-white/10">Reservado</span>
                  ) : null}
                </div>

                {!completo && item.disponivelParaReserva ? (
                  <form onSubmit={(e) => void reserve(e, item.id)} className="mt-4 grid gap-2 border-t border-black/10 pt-4 dark:border-white/10 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm sm:col-span-2">
                      Seu nome
                      <input
                        name="nomeVisitante"
                        required
                        className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
                      />
                    </label>
                    <label className="grid gap-1 text-sm">
                      E-mail (opcional)
                      <input
                        name="emailVisitante"
                        type="email"
                        className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10"
                      />
                    </label>
                    <label className="grid gap-1 text-sm">
                      Telefone (opcional)
                      <input name="telefone" className="min-h-10 rounded-md border border-black/10 px-3 dark:border-white/10 dark:bg-white/10" />
                    </label>
                    <div className="sm:col-span-2">
                      <Button type="submit" disabled={reserveMutation.isPending}>
                        {reserveMutation.isPending ? "Reservando..." : "Reservar este item"}
                      </Button>
                    </div>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
