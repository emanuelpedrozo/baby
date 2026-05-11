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

export async function apiFetch<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? "Erro na requisicao.");
  }

  return response.json() as Promise<T>;
}
