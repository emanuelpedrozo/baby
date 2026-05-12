"use client";

import { Download, Shield } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { emitToast } from "@/lib/toast";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";

export function ContaSection() {
  const { session, setSession } = useAppStore();
  const router = useRouter();
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);

  if (!session?.accessToken) {
    return (
      <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
        <p className="text-sm text-black/70 dark:text-white/75">Entre na sua conta para acessar dados e privacidade.</p>
        <p className="mt-2 text-xs text-black/55 dark:text-white/55">
          Os dados pessoais sao tratados conforme a LGPD. A exportacao inclui projetos, itens e checklist vinculados ao seu usuario.
        </p>
      </div>
    );
  }

  async function exportarLgpd() {
    setBusy("export");
    try {
      const data = await apiFetch<unknown>("/usuarios/exportacao-lgpd");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exportacao-lgpd-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      emitToast("Exportacao baixada.", "success");
    } catch (err) {
      emitToast(err instanceof Error ? err.message : "Falha na exportacao.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function excluirConta() {
    const ok = window.confirm(
      "Tem certeza? Sua conta sera marcada como excluida e voce sera desconectado. Esta acao nao pode ser desfeita pelo aplicativo."
    );
    if (!ok) return;
    setBusy("delete");
    try {
      await apiFetch("/usuarios/conta", { method: "DELETE" });
      setSession(undefined);
      emitToast("Conta encerrada.", "info");
      router.push("/");
    } catch (err) {
      emitToast(err instanceof Error ? err.message : "Nao foi possivel excluir a conta.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-md bg-sage-100 text-sage-800 dark:bg-white/10 dark:text-sage-200">
          <Shield size={24} aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Conta e privacidade</h2>
          <p className="text-sm text-black/60 dark:text-white/65">{session.usuario.nome} · {session.usuario.email}</p>
        </div>
      </div>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
        <h3 className="font-semibold">Exportacao de dados (LGPD)</h3>
        <p className="mt-2 text-sm text-black/65 dark:text-white/70">
          Baixe uma copia dos seus dados em formato JSON (usuario e projetos com itens, categorias, checklist e reservas).
        </p>
        <Button type="button" className="mt-4" onClick={() => void exportarLgpd()} disabled={busy !== null}>
          <Download size={16} aria-hidden />
          {busy === "export" ? "Gerando..." : "Baixar exportacao"}
        </Button>
      </section>

      <section className="rounded-lg border border-clay-200 bg-clay-50/50 p-5 dark:border-clay-800 dark:bg-clay-950/30">
        <h3 className="font-semibold text-clay-900 dark:text-clay-100">Excluir conta</h3>
        <p className="mt-2 text-sm text-clay-800 dark:text-clay-200">
          Remove o acesso a esta conta. Em caso de duvida, exporte seus dados antes.
        </p>
        <Button type="button" variant="secondary" className="mt-4 border-clay-300 text-clay-900 dark:border-clay-700" onClick={() => void excluirConta()} disabled={busy !== null}>
          {busy === "delete" ? "Processando..." : "Excluir minha conta"}
        </Button>
      </section>

      <p className="text-xs text-black/55 dark:text-white/55">
        Politica de privacidade detalhada pode ser vinculada aqui quando disponivel.{" "}
        <Link href="/" className="underline">
          Voltar ao painel
        </Link>
      </p>
    </div>
  );
}
