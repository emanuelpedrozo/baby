/** Labels para filtro de status de item (alinhado ao enum Prisma StatusItem). */
export const ITEM_STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos" },
  { value: "NAO_INICIADO", label: "Nao iniciado" },
  { value: "EM_PESQUISA", label: "Em pesquisa" },
  { value: "PARCIAL", label: "Parcial" },
  { value: "COMPLETO", label: "Completo" },
  { value: "COMPRADO", label: "Comprado" },
  { value: "GANHO", label: "Ganho" },
  { value: "CANCELADO", label: "Cancelado" }
];

export const ITEM_SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "prioridade", label: "Prioridade (padrao)" },
  { value: "nome", label: "Nome A-Z" },
  { value: "nome_desc", label: "Nome Z-A" }
];

export const PRIORIDADE_OPTIONS = [
  { value: "BAIXA", label: "Baixa" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
  { value: "ESSENCIAL", label: "Essencial" }
] as const;
