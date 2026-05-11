import { describe, expect, it } from "vitest";

function status(necessaria: number, comprada: number, ganha: number) {
  const total = comprada + ganha;
  if (total === 0) return "NAO_INICIADO";
  if (total < necessaria) return "PARCIAL";
  return "COMPLETO";
}

describe("status do item", () => {
  it("recalcula pelos totais do enxoval", () => {
    expect(status(6, 0, 0)).toBe("NAO_INICIADO");
    expect(status(6, 2, 1)).toBe("PARCIAL");
    expect(status(6, 6, 0)).toBe("COMPLETO");
  });
});
