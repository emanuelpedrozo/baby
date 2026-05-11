"use client";

import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { demoProject } from "./demo-data";
import { useProjectId } from "./use-project-id";

export function PresentesSection() {
  const { session, projectId, isDemo, projects } = useProjectId();
  const [copied, setCopied] = useState("");

  const shareSlug = useMemo(() => {
    if (isDemo) return demoProject.shareSlug;
    const p = projects.data?.find((x) => x.id === projectId);
    return p?.shareSlug;
  }, [isDemo, projectId, projects.data]);

  const publicPath = shareSlug ? `/publico/listas/${shareSlug}` : "";

  function copyLink() {
    if (!shareSlug || typeof window === "undefined") return;
    const url = `${window.location.origin}${publicPath}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied("Copiado.");
      setTimeout(() => setCopied(""), 2000);
    });
  }

  return (
    <div className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
      <div>
        <h2 className="text-base font-semibold">Lista publica de presentes</h2>
        <p className="mt-1 text-sm text-black/60 dark:text-white/65">
          Compartilhe o link com familia e amigos. Eles veem itens disponiveis e podem reservar por 48 horas.
        </p>
      </div>

      {shareSlug ? (
        <div className="grid gap-2 rounded-md border border-black/10 bg-sage-50/50 p-4 dark:border-white/10 dark:bg-white/5">
          <code className="break-all text-xs text-black/80 dark:text-white/80">
            {typeof window !== "undefined" ? window.location.origin : ""}
            {publicPath}
          </code>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={copyLink}>
              Copiar link
            </Button>
            <Link
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition hover:bg-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <ExternalLink size={16} aria-hidden />
              Abrir lista
            </Link>
          </div>
          {copied ? <p className="text-xs text-sage-700 dark:text-sage-300">{copied}</p> : null}
        </div>
      ) : (
        <p className="text-sm text-black/60 dark:text-white/65">
          {session?.accessToken && !projectId
            ? "Crie um projeto para gerar o link da lista."
            : "Nao foi possivel obter o identificador da lista."}
        </p>
      )}

      {!session?.accessToken ? (
        <p className="text-xs text-black/60 dark:text-white/65">
          No modo demo, o link usa a lista de exemplo <strong>demo-lista</strong> (requer backend com seed).
        </p>
      ) : null}
    </div>
  );
}
