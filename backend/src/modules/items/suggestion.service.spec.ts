import { TamanhoItem } from "@prisma/client";
import { SuggestionService } from "./suggestion.service";

describe("SuggestionService", () => {
  const service = new SuggestionService();

  it("sugere quantidade media para body RN", () => {
    expect(service.suggest({ nome: "Body", tamanho: TamanhoItem.RN }).quantidadeSugerida).toBe(6);
  });

  it("ajusta item sensivel ao clima frio", () => {
    expect(service.suggest({ nome: "Manta", climaRegiao: "frio" }).quantidadeSugerida).toBe(3);
  });

  it("reduz manga longa em clima quente", () => {
    expect(service.suggest({ nome: "Macacao manga longa", climaRegiao: "quente" }).quantidadeSugerida).toBe(4);
  });
});
