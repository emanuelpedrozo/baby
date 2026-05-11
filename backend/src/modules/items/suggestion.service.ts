import { Injectable } from "@nestjs/common";
import { SexoBebe, TamanhoItem } from "@prisma/client";

const BASE: Record<string, number> = {
  "body rn": 6,
  "body p": 8,
  "fraldas rn": 200,
  "paninhos de boca": 10,
  "manta": 2,
  "toalha": 3,
  "macacao": 6
};

@Injectable()
export class SuggestionService {
  suggest(params: { nome: string; tamanho?: TamanhoItem; climaRegiao?: string | null; sexo?: SexoBebe }) {
    const key = `${params.nome} ${params.tamanho ?? ""}`.toLowerCase();
    const match = Object.entries(BASE).find(([term]) => key.includes(term));
    let quantidade = match?.[1] ?? 1;

    if (params.climaRegiao?.toLowerCase().includes("frio") && key.includes("manta")) {
      quantidade += 1;
    }
    if (params.climaRegiao?.toLowerCase().includes("quente") && key.includes("manga longa")) {
      quantidade = Math.max(quantidade - 2, 1);
    }

    return {
      quantidadeSugerida: quantidade,
      criterios: {
        climaRegiao: params.climaRegiao ?? "nao informado",
        sexo: params.sexo ?? "NAO_INFORMADO",
        base: match ? "media de mercado" : "padrao conservador"
      }
    };
  }
}
