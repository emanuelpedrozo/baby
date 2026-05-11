import { StatusItem } from "@prisma/client";

export function calcularStatusItem(params: {
  quantidadeComprada?: number;
  quantidadeGanha?: number;
  quantidadeNecessaria?: number;
  status?: StatusItem;
}) {
  if (params.status === StatusItem.CANCELADO || params.status === StatusItem.EM_PESQUISA) {
    return params.status;
  }

  const comprada = params.quantidadeComprada ?? 0;
  const ganha = params.quantidadeGanha ?? 0;
  const necessaria = Math.max(params.quantidadeNecessaria ?? 1, 0);
  const total = comprada + ganha;

  if (total === 0) {
    return StatusItem.NAO_INICIADO;
  }
  if (total < necessaria) {
    return StatusItem.PARCIAL;
  }
  return StatusItem.COMPLETO;
}
