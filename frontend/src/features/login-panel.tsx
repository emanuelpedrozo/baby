"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiFetch, type ApiSession } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";

const demoEmailPlaceholder = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "voce@exemplo.com";

export function LoginPanel() {
  const { session, setSession } = useAppStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userLabel = useMemo(() => session?.usuario.nome ?? "Modo demonstracao", [session]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<ApiSession>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          senha: form.get("senha")
        })
      });
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<ApiSession>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nome: form.get("nome"),
          email: form.get("email"),
          senha: form.get("senha"),
          consentimentoLgpd: true
        })
      });
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 border-t border-black/10 pt-4 dark:border-white/10">
      <p className="text-sm font-medium">{userLabel}</p>
      {session ? (
        <button className="mt-3 text-sm text-clay-600 dark:text-clay-100" type="button" onClick={() => setSession(undefined)}>
          Sair
        </button>
      ) : (
        <div className="mt-3 grid gap-3">
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              className={`rounded-md px-2 py-1 font-medium ${mode === "login" ? "bg-sage-100 text-sage-800 dark:bg-white/15" : "text-black/60 dark:text-white/60"}`}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`rounded-md px-2 py-1 font-medium ${mode === "register" ? "bg-sage-100 text-sage-800 dark:bg-white/15" : "text-black/60 dark:text-white/60"}`}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Criar conta
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={login} className="grid gap-2">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={demoEmailPlaceholder}
                className="min-h-10 rounded-md border border-black/10 px-3 text-sm dark:border-white/10 dark:bg-white/10"
              />
              <input
                name="senha"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Senha"
                className="min-h-10 rounded-md border border-black/10 px-3 text-sm dark:border-white/10 dark:bg-white/10"
              />
              <Button type="submit" variant="secondary" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <form onSubmit={register} className="grid gap-2">
              <input
                name="nome"
                type="text"
                required
                placeholder="Seu nome"
                className="min-h-10 rounded-md border border-black/10 px-3 text-sm dark:border-white/10 dark:bg-white/10"
              />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={demoEmailPlaceholder}
                className="min-h-10 rounded-md border border-black/10 px-3 text-sm dark:border-white/10 dark:bg-white/10"
              />
              <input
                name="senha"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Senha (min. 8 caracteres)"
                className="min-h-10 rounded-md border border-black/10 px-3 text-sm dark:border-white/10 dark:bg-white/10"
              />
              <Button type="submit" variant="secondary" disabled={loading}>
                {loading ? "Criando..." : "Cadastrar"}
              </Button>
            </form>
          )}
          {error ? <p className="text-xs text-clay-600 dark:text-clay-100">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
