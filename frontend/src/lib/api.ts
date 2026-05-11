import { useAppStore } from "./store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

export type ApiSession = {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    papel: string;
    tenantId: string;
  };
};

function isAuthPath(path: string) {
  return path.startsWith("/auth/login") || path.startsWith("/auth/register") || path.startsWith("/auth/refresh");
}

async function parseErrorMessage(response: Response) {
  const body = await response.json().catch(() => ({}));
  return typeof body.message === "string" ? body.message : "Erro na requisicao.";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, tokenOverride?: string): Promise<T> {
  const headersBase: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined)
  };

  const requestOnce = async (accessToken: string | undefined) => {
    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...headersBase,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      }
    });
  };

  const store = useAppStore.getState();
  let accessToken = tokenOverride ?? store.session?.accessToken;
  let response = await requestOnce(accessToken);

  if (response.status === 401 && !isAuthPath(path) && store.session?.refreshToken && !tokenOverride) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: store.session.refreshToken })
    });

    if (refreshRes.ok) {
      const data = (await refreshRes.json()) as ApiSession;
      store.setSession(data);
      accessToken = data.accessToken;
      response = await requestOnce(accessToken);
    } else {
      store.setSession(undefined);
    }
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

/** Requisições públicas (sem JWT e sem tentativa de refresh). */
export async function publicApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined)
    }
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json() as Promise<T>;
}
