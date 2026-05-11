import { StatusItem } from "@prisma/client";
import { calcularStatusItem } from "./status";

describe("calcularStatusItem", () => {
  it("retorna NAO_INICIADO quando nada foi comprado ou ganho", () => {
    expect(calcularStatusItem({ quantidadeNecessaria: 6, quantidadeComprada: 0, quantidadeGanha: 0 })).toBe(
      StatusItem.NAO_INICIADO
    );
  });

  it("retorna PARCIAL quando o total e menor que o necessario", () => {
    expect(calcularStatusItem({ quantidadeNecessaria: 6, quantidadeComprada: 2, quantidadeGanha: 1 })).toBe(
      StatusItem.PARCIAL
    );
  });

  it("retorna COMPLETO quando o total alcanca o necessario", () => {
    expect(calcularStatusItem({ quantidadeNecessaria: 6, quantidadeComprada: 5, quantidadeGanha: 1 })).toBe(
      StatusItem.COMPLETO
    );
  });

  it("preserva status manual de cancelamento", () => {
    expect(
      calcularStatusItem({
        quantidadeNecessaria: 6,
        quantidadeComprada: 6,
        quantidadeGanha: 0,
        status: StatusItem.CANCELADO
      })
    ).toBe(StatusItem.CANCELADO);
  });

  it("preserva status manual de pesquisa", () => {
    expect(
      calcularStatusItem({
        quantidadeNecessaria: 6,
        quantidadeComprada: 0,
        quantidadeGanha: 0,
        status: StatusItem.EM_PESQUISA
      })
    ).toBe(StatusItem.EM_PESQUISA);
  });
});
