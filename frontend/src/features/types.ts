export type Project = {
  id: string;
  nomeBebe: string;
  sexo: string;
  dataPrevistaParto: string;
  temaQuarto?: string;
  orcamentoTotal: string | number;
  moeda: string;
  shareSlug?: string;
  climaRegiao?: string | null;
  fotoQuarto?: string | null;
};

export type Dashboard = {
  projeto: Project;
  indicadores: {
    progressoEnxoval: number;
    totalGasto: number;
    custoPrevisto: number;
    saldo: number;
    economia: number;
    excedente: number;
    itensRestantes: number;
    categoriasCompletas: number;
    checklistMaternidade: number;
    semanasGestacao: number;
    proximoPasso: string;
  };
  porCategoria: Array<{
    id: string;
    nome: string;
    cor?: string;
    totalItens: number;
    progresso: number;
    gasto: number;
  }>;
};

export type ItemEnxoval = {
  id: string;
  nome: string;
  status: string;
  prioridade: string;
  quantidadeNecessaria: number;
  quantidadeComprada: number;
  quantidadeGanha: number;
  valorEstimado: string | number;
  valorPago: string | number;
  linkCompra?: string | null;
  imagem?: string | null;
  categoria: { id?: string; nome: string; cor?: string };
};

export type ChecklistItem = {
  id: string;
  tipo: "MAE" | "BEBE" | "ACOMPANHANTE" | "DOCUMENTOS";
  nome: string;
  concluido: boolean;
};

export type Category = {
  id: string;
  nome: string;
  cor?: string;
  icone?: string | null;
  prioridade?: number;
  ordem?: number;
  padrao?: boolean;
};
