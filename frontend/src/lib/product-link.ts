/** Normaliza texto colado na URL do produto para envio a API (https implicito). */
export function normalizeProductLink(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}
