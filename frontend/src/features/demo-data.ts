import type { ChecklistItem, Dashboard, ItemEnxoval, Project } from "./types";

export const demoProject: Project = {
  id: "demo",
  nomeBebe: "Caio Emanuel",
  sexo: "MASCULINO",
  dataPrevistaParto: new Date(Date.now() + 1000 * 60 * 60 * 24 * 88).toISOString(),
  temaQuarto: "Safari suave",
  orcamentoTotal: 6500,
  moeda: "BRL",
  shareSlug: "demo-lista"
};

export const demoDashboard: Dashboard = {
  projeto: demoProject,
  indicadores: {
    progressoEnxoval: 42,
    totalGasto: 1830,
    custoPrevisto: 5240,
    saldo: 4670,
    economia: 410,
    excedente: 0,
    itensRestantes: 38,
    categoriasCompletas: 3,
    checklistMaternidade: 35,
    semanasGestacao: 27,
    proximoPasso: "Montar quarto e revisar compras grandes."
  },
  porCategoria: [
    { id: "1", nome: "Roupas RN", cor: "#8aa38b", totalItens: 12, progresso: 68, gasto: 530 },
    { id: "2", nome: "Higiene", cor: "#d9b8a8", totalItens: 9, progresso: 38, gasto: 290 },
    { id: "3", nome: "Quarto", cor: "#c8b7a6", totalItens: 8, progresso: 25, gasto: 850 },
    { id: "4", nome: "Hospital", cor: "#95a7b5", totalItens: 6, progresso: 55, gasto: 160 }
  ]
};

export const demoItems: ItemEnxoval[] = [
  {
    id: "1",
    nome: "Body RN manga curta",
    status: "PARCIAL",
    prioridade: "ESSENCIAL",
    quantidadeNecessaria: 6,
    quantidadeComprada: 2,
    quantidadeGanha: 1,
    valorEstimado: 35,
    valorPago: 70,
    categoria: { nome: "Roupas RN", cor: "#8aa38b" }
  },
  {
    id: "2",
    nome: "Fraldas RN",
    status: "NAO_INICIADO",
    prioridade: "ESSENCIAL",
    quantidadeNecessaria: 200,
    quantidadeComprada: 0,
    quantidadeGanha: 0,
    valorEstimado: 1.1,
    valorPago: 0,
    categoria: { nome: "Higiene", cor: "#d9b8a8" }
  },
  {
    id: "3",
    nome: "Berco",
    status: "COMPLETO",
    prioridade: "ALTA",
    quantidadeNecessaria: 1,
    quantidadeComprada: 1,
    quantidadeGanha: 0,
    valorEstimado: 900,
    valorPago: 850,
    categoria: { nome: "Quarto", cor: "#c8b7a6" }
  }
];

export const demoChecklist: ChecklistItem[] = [
  { id: "1", tipo: "BEBE", nome: "Bodies RN", concluido: true },
  { id: "2", tipo: "BEBE", nome: "Manta", concluido: false },
  { id: "3", tipo: "MAE", nome: "Documentos pessoais", concluido: true },
  { id: "4", tipo: "DOCUMENTOS", nome: "Cartao pre-natal", concluido: false }
];
